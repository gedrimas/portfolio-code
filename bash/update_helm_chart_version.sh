#!/usr/bin/env bash

CHART_PATH=$1

CURRENT_CHART_VERSION=$(grep 'version: [0-9]*\.[0-9]*\.[0-9]*' $CHART_PATH)
CURRENT_APP_VERSION=$(grep 'appVersion: "[0-9]*\.[0-9]*\.[0-9]*"' $CHART_PATH)

NEW_CHART_PATCH='latest'
NEW_APP_PATCH='latest'

CHART_PATCH=$(cut -d . -f 3 <<< $CURRENT_CHART_VERSION)
APP_PATCH=$(cut -d . -f 3 <<< ${CURRENT_APP_VERSION%\"*})

function updateAppPatch() {
    
    if [[ $1 =~ ^0 ]]
    then
        LAST_DIDGIT=${1: -1}
        NEW_APP_PATCH=$(($LAST_DIDGIT + 1))
    else
        NEW_APP_PATCH=$(($1 + 1))
    fi        
}

updateAppPatch "$APP_PATCH"


function updateChartPatch() {
    
    if [[ $1 =~ ^0 ]]
    then
        LAST_DIDGIT=${1: -1}
        NEW_CHART_PATCH=$(($LAST_DIDGIT + 1))
    else
        NEW_CHART_PATCH=$(($1 + 1))
    fi        
}

updateChartPatch "$CHART_PATCH"

sed -i "s|\.[0-9]*$|".$NEW_CHART_PATCH"|" $CHART_PATH
sed -i "s|\.[0-9]\"$|".$NEW_APP_PATCH"\"|" $CHART_PATH

