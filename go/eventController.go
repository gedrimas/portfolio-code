package controllers

import (
	"api-regapp/database"
	"api-regapp/helpers"
	"api-regapp/models"
	"context"
	"fmt"
	"time"

	"github.com/gedrimas/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type createEventReq struct {
	Event       string    `json:"event" validate:"required"`
	Start       time.Time `json:"start" validate:"required"`
	End         time.Time `json:"end" validate:"required"`
	Description string    `json:"description"`
	Trainer     string    `json:"trainer"`
	Places      string    `json:"places" validate:"required"`
	Visitors    []string  `json:"visitors"`
	Day         string    `json:"day"`
}

type updateEventReq struct {
	Event       string    `json:"event" validate:"required"`
	Start       time.Time `json:"start" validate:"required"`
	End         time.Time `json:"end" validate:"required"`
	Description string    `json:"description"`
	Trainer     string    `json:"trainer"`
	Places      string    `json:"places" validate:"required"`
	Visitors    []string  `json:"visitors"`
	Day         string    `json:"day"`
	EventId     string    `json:"eventId"`
}

var validate = validator.New()
var eventCollection *mongo.Collection = database.OpenCollection(database.Client, "event")
var companyCollection *mongo.Collection = database.OpenCollection(database.Client, "company")

func CreateEvent() gin.HandlerFunc {
	return func(c *gin.Context) {

		sendor := response.NewSendor(c)
		badRequest := response.GetResponse("badRequest")

		if err := helpers.VerifyUserType(c, "ADMIN"); err != nil {
			badRequest.SetData(err.Error())
			sendor.Send(badRequest)
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var req createEventReq

		if err := c.BindJSON(&req); err != nil {
			badRequest.SetData(err.Error())
			sendor.Send(badRequest)
			return
		}

		eventId := primitive.NewObjectID()
		companyId := c.GetString("company_id")
		adminId := c.GetString("user_id")

		eventDuration := helpers.SplitEventTime(req.Start, req.End)
		eventLen := len(eventDuration) - 1

		newEvent := models.Event{
			Id:       eventId,
			Event_id: eventId.Hex(),
			Event:    req.Event,
			Start:    req.Start,
			End:      req.End,
			Description: req.Description,
			Trainer:     req.Trainer,
			Places:      req.Places,
			Visitors:    []string{},
			Day:         req.Day,
			Company_id:  companyId,
			Admin_id:    adminId,
			Len:         eventLen,
		}

		if validRequestError := validate.Struct(&newEvent); validRequestError != nil {
			eventCreationBadRequest := response.GetResponse("eventCreationError")
			eventCreationBadRequest.SetData(validRequestError)
			sendor.Send(eventCreationBadRequest)
			return
		}

		_, err := eventCollection.InsertOne(ctx, newEvent)

		if err != nil {
			eventSavingError := response.GetResponse("eventSavingError")
			eventSavingError.SetData(err)
			sendor.Send(eventSavingError)
			return
		}

		events, err := eventCollection.Find(ctx, bson.M{"company_id": companyId})

		eventsGettingError := response.GetResponse("eventsGettingError")
		if err != nil {
			eventsGettingError.SetData(err)
			sendor.Send(eventsGettingError)
			return
		}

		var allEvents []models.Event
		if err := events.All(ctx, &allEvents); err != nil {
			eventsGettingError.SetData(err)
			sendor.Send(eventsGettingError)
			return
		}

		eventsGettingSuccess := response.GetResponse("eventCreationSuccess")
		eventsGettingSuccess.SetData(allEvents)
		sendor.Send(eventsGettingSuccess)

	}
}

func GetEvents() gin.HandlerFunc {
	return func(c *gin.Context) {

		sendor := response.NewSendor(c)
		eventsGettingError := response.GetResponse("eventsGettingError")

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		company_id := c.Param("company_id")

		events, err := eventCollection.Find(ctx, bson.M{"company_id": company_id})
		if err != nil {
			eventsGettingError.SetData(err)
			sendor.Send(eventsGettingError)
			return
		}

		var allEvents []models.Event
		if err := events.All(ctx, &allEvents); err != nil {
			eventsGettingError.SetData(err)
			sendor.Send(eventsGettingError)
			return
		}

		eventsGettingSuccess := response.GetResponse("eventsGettingSuccess")
		eventsGettingSuccess.SetData(allEvents)
		sendor.Send(eventsGettingSuccess)
	}
}

func GetEventsByToken() gin.HandlerFunc {
	return func(c *gin.Context) {

		sendor := response.NewSendor(c)
		eventsGettingError := response.GetResponse("eventsGettingError")

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		company_id := c.GetString("company_id")

		events, err := eventCollection.Find(ctx, bson.M{"company_id": company_id})
		if err != nil {
			eventsGettingError.SetData(err)
			sendor.Send(eventsGettingError)
			return
		}

		var allEvents []models.Event
		if err := events.All(ctx, &allEvents); err != nil {
			eventsGettingError.SetData(err)
			sendor.Send(eventsGettingError)
			return
		}

		eventsGettingSuccess := response.GetResponse("eventsGettingSuccess")
		eventsGettingSuccess.SetData(allEvents)
		sendor.Send(eventsGettingSuccess)
	}
}

func DeleteEvent() gin.HandlerFunc {
	return func(c *gin.Context) {

		sendor := response.NewSendor(c)
		eventDeletionError := response.GetResponse("eventDeletionError")
		eventsGettingError := response.GetResponse("eventsGettingError")

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		event_id := c.Param("event_id")
		_, err := eventCollection.DeleteOne(ctx, bson.M{"event_id": event_id})
		if err != nil {
			eventDeletionError.SetData(err)
			sendor.Send(eventDeletionError)
			return
		}

		company_id := c.GetString("company_id")
		fmt.Println("COMPANY", company_id)
		events, err := eventCollection.Find(ctx, bson.M{"company_id": company_id})
		if err != nil {
			eventsGettingError.SetData(err)
			sendor.Send(eventsGettingError)
			return
		}

		var allEvents []models.Event
		if err := events.All(ctx, &allEvents); err != nil {
			eventDeletionError.SetData(err)
			sendor.Send(eventDeletionError)
			return
		}

		eventsGettingSuccess := response.GetResponse("eventsGettingSuccess")
		eventsGettingSuccess.SetData(allEvents)
		sendor.Send(eventsGettingSuccess)
	}
}

func UpdateEvent() gin.HandlerFunc {
	return func(c *gin.Context) {

		sendor := response.NewSendor(c)
		badRequest := response.GetResponse("badRequest")

		if err := helpers.VerifyUserType(c, "ADMIN"); err != nil {
			badRequest.SetData(err.Error())
			sendor.Send(badRequest)
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var req updateEventReq

		if err := c.BindJSON(&req); err != nil {
			badRequest.SetData(err.Error())
			sendor.Send(badRequest)
			return
		}

		filter := bson.D{{"event_id", req.EventId}}
		updateEvent := bson.D{{"$set", bson.D{
			{"event", req.Event},
			{"start", req.Start},
			{"end", req.End},
			{"description", req.Description},
			{"trainer", req.Trainer},
			{"places", req.Places},
			{"day", req.Day},
		}}}

		_, err := eventCollection.UpdateOne(ctx, filter, updateEvent)

		if err != nil {
			eventUpdationError := response.GetResponse("eventUpdationError")
			eventUpdationError.SetData(err)
			sendor.Send(eventUpdationError)
			return
		}

		companyId := c.GetString("company_id")
		events, err := eventCollection.Find(ctx, bson.M{"company_id": companyId})

		eventsGettingError := response.GetResponse("eventsGettingError")
		if err != nil {
			eventsGettingError.SetData(err)
			sendor.Send(eventsGettingError)
			return
		}

		var allEvents []models.Event
		if err := events.All(ctx, &allEvents); err != nil {
			eventsGettingError.SetData(err)
			sendor.Send(eventsGettingError)
			return
		}

		eventsGettingSuccess := response.GetResponse("eventCreationSuccess")
		eventsGettingSuccess.SetData(allEvents)
		sendor.Send(eventsGettingSuccess)
	}
}
