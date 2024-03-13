package controllers

import (
	"api-regapp/models"
	"context"
	"errors"
	"strings"
	"sync"
	"time"

	"github.com/gedrimas/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func gorutineRecovery(channel interface{}) {
	if arg := recover(); arg != nil {

		switch c := channel.(type) {
			case chan models.Visitor:
				if err, ok := arg.(error); ok {
					c <- models.Visitor{VisitorError: err}
				}
				if str, ok := arg.(string); ok {
					c <- models.Visitor{VisitorError: errors.New(str)}
				}
		}
	}
}


func GetVisitors() gin.HandlerFunc {
	return func(c *gin.Context) {

		sendor := response.NewSendor(c)
		visitorGettingError := response.GetResponse("visitorsGettingError")
		visitorsGettingSuccess := response.GetResponse("visitorsGettingSuccess")

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		visitorsId := strings.Split(c.Param("ids"), ",")
		opts := options.Find().SetProjection(bson.D{{Key: "username", Value: 1}, {Key: "email", Value: 1}, {Key: "phone", Value: 1}, {Key: "facebook", Value: 1}})

		var visitor []models.Visitor
		vChan := make(chan models.Visitor, 10)

		var waitGroup = sync.WaitGroup{}
		waitGroup.Add(len(visitorsId))

		func() {
			for _, vId := range visitorsId {
				go func(v_id string, v_chan chan models.Visitor) {
					defer gorutineRecovery(v_chan)

					filter := bson.M{"user_id": v_id}
					if v, err := userCollection.Find(ctx, filter, opts); err != nil {
						waitGroup.Done()
						panic(err)
					} else {
						if err = v.All(ctx, &visitor); err != nil {
							waitGroup.Done()
							panic(err)
						} else {
							if len(visitor) > 0 {
								vChan <- visitor[0]
							}
						}
					}

					waitGroup.Done()
				}(vId, vChan)
			}
			waitGroup.Wait()
			close(vChan)
		}()
			
		
		var visitors []models.Visitor
		for v := range vChan {

			if v.VisitorError != nil {
				visitorGettingError.SetData(v.VisitorError)
				sendor.Send(visitorGettingError)
				return
			}
			visitors = append(visitors, v)
		}

		visitorsGettingSuccess.SetData(visitors)
		sendor.Send(visitorsGettingSuccess)
		return
	}
}
