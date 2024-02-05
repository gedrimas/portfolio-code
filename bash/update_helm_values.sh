#!/usr/bin/env bash

VALUES_PATH=$1
PROJECT_NAME=$2
VERSION=$3
TARGET_BRANCH=$4

case $PROJECT_NAME in
    "api-regapp" )
        sed -i "s|gedrimas/regapp:api.v[0-9]*\.[0-9]*\.[0-9]*|gedrimas/regapp:$VERSION|" $VALUES_PATH ;;
    "regapp-client" )
        sed -i "s|gedrimas/regapp:client.v[0-9]*\.[0-9]*\.[0-9]*|gedrimas/regapp:$VERSION|" $VALUES_PATH ;;
    "auth-regapp" )
        sed -i "s|gedrimas/regapp:auth.v[0-9]*\.[0-9]*\.[0-9]*|gedrimas/regapp:$VERSION|" $VALUES_PATH ;;
    "booking-regapp" )
        sed -i "s|gedrimas/regapp:booking.v[0-9]*\.[0-9]*\.[0-9]*|gedrimas/regapp:$VERSION|" $VALUES_PATH ;;        
esac

sed -i "s|host: regapp.*|host: regapp.$TARGET_BRANCH|" $VALUES_PATH