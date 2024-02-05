package controllers

import (
	"context"
	"log"
	"time"

	"auth-regapp/database"
	"auth-regapp/helpers"
	"auth-regapp/model"

	"github.com/gedrimas/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var userCollection *mongo.Collection = database.OpenCollection(database.Client, "user")
var companyCollection *mongo.Collection = database.OpenCollection(database.Client, "company")

var validate = validator.New()

type adminSignupRequest struct {
	Username string `json:"username" validate:"required,min=3,max=100"`
	Password string `json:"password" validate:"required,min=8"`
	Email    string `json:"email" validate:"email,required"`
	Company  string `json:"company" validate:"required"`
}

func AdminSignup() gin.HandlerFunc {

	return func(c *gin.Context) {

		sendor := response.NewSendor(c)

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		var req adminSignupRequest
		if err := c.BindJSON(&req); err != nil {
			badRequest := response.GetResponse("badRequest")
			badRequest.SetData(err.Error())
			sendor.Send(badRequest)
			return
		}

		regexUsername := bson.M{"$regex": primitive.Regex{Pattern: req.Username, Options: "i"}}
		usernameCount, usernameErr := userCollection.CountDocuments(ctx, bson.M{"username": regexUsername})

		if usernameErr != nil {
			userGetErr := response.GetResponse("userGetError")
			userGetErr.SetData(usernameErr)
			sendor.Send(userGetErr)
			log.Panic(usernameErr)
		}

		if usernameCount > 0 {
			userExistsErr := response.GetResponse("userExistsError")
			userExistsErr.SetData(nil)
			sendor.Send(userExistsErr)
			return
		}

		regexEmail := bson.M{"$regex": primitive.Regex{Pattern: req.Email, Options: "i"}}
		emailCount, emailErr := userCollection.CountDocuments(ctx, bson.M{"email": regexEmail})

		if emailErr != nil {
			emailGetErr := response.GetResponse("emailGetError")
			emailGetErr.SetData(emailErr)
			sendor.Send(emailGetErr)
			log.Panic(emailErr)
		}

		if emailCount > 0 {
			emailExistsErr := response.GetResponse("emailExistsError")
			emailExistsErr.SetData(nil)
			sendor.Send(emailExistsErr)
			return
		}

		regexCompany := bson.M{"$regex": primitive.Regex{Pattern: req.Company, Options: "i"}}
		companyCount, companyErr := companyCollection.CountDocuments(ctx, bson.M{"company": regexCompany})

		if companyErr != nil {
			companyGetErr := response.GetResponse("companyGetError")
			companyGetErr.SetData(companyErr)
			sendor.Send(companyGetErr)
			log.Panic(companyErr)
		}

		if companyCount > 0 {
			companyExistsErr := response.GetResponse("companyExistsError")
			companyExistsErr.SetData(nil)
			sendor.Send(companyExistsErr)
			return
		}

	
		ID := primitive.NewObjectID()
		User_id := ID.Hex()

		var company model.Company
		company.ID = primitive.NewObjectID()
		company.Company_id = company.ID.Hex()
		company.Company = req.Company
		company.Admin_id = User_id

		result, err := companyCollection.InsertOne(ctx, company)
		if err != nil {
			companyCreationErr := response.GetResponse("companyCreationError")
			companyCreationErr.SetData(companyErr)
			sendor.Send(companyCreationErr)
			log.Panic(err)
		}

		var companyId string
		if id, ok := result.InsertedID.(primitive.ObjectID); ok {
			companyId = id.Hex()
		} else {
			companyCreationErr := response.GetResponse("companyCreationError")
			companyCreationErr.SetData(companyErr)
			sendor.Send(companyCreationErr)
			log.Panic(err)
		}

		password := helpers.EncodePassword(req.Password)
		Created_at, _ := time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		Updated_at, _ := time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		token, _ := helpers.GenerateToken(User_id, req.Username, "ADMIN", companyId)

		newUser := model.User{
			ID:         ID,
			User_id:    User_id,
			Username:   req.Username,
			User_type:  "ADMIN",
			Email:      req.Email,
			Company_id: companyId,
			Password:   password,
			Token:      token,
			Created_at: Created_at,
			Updated_at: Updated_at,
		}

		inResult, err := userCollection.InsertOne(ctx, newUser)

		if err != nil {
			userCreationErr := response.GetResponse("userCreationError")
			userCreationErr.SetData(err)
			sendor.Send(userCreationErr)
			log.Panic(err)
		}

		var newUserId string
		if id, ok := inResult.InsertedID.(primitive.ObjectID); ok {
			newUserId = id.Hex()
		}

		var createdUser model.User
		err = userCollection.FindOne(ctx, bson.D{{"user_id", newUserId}}).Decode(&createdUser)
		if err != nil {
			userGetErr := response.GetResponse("userGetError")
			userGetErr.SetData(err)
			sendor.Send(userGetErr)
			log.Panic(err)
		}

		data := map[string]string{"token": createdUser.Token, "user_type": createdUser.User_type, "company_id": createdUser.Company_id}

		signupSuccess := response.GetResponse("signuppSuccess")
		signupSuccess.SetData(data)
		sendor.Send(signupSuccess)
		return

	}
}
