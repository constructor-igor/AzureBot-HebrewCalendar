"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var kdate = require("./kdate.js");
var formatting = require("./formatting.js")

function getHebMonthOnEnglish(hMonth)
{
	var monthName = kdate.getHebMonth_v1(hMonth);
	return monthName;
}
function getHebMonth(hMonth)
{
	return getHebMonthOnEnglish(hMonth);
}

function hebDateToString(hebDate)
{
	var hmS = hebDate.substring(hebDate.indexOf(' ')+1, hebDate.length);
	var hDay = parseInt(hebDate.substring(0, hebDate.indexOf(' ')));
	var hMonth = parseInt(hmS.substring(0, hmS.indexOf(' ')))+1;
	var hYear = hmS.substring(hmS.indexOf(' ')+1, hmS.length);
	var hYearStr = hYear;

	var hebMonthName = getHebMonth(hMonth);
	var fullDate = formatting.FormatDay_v1(hDay) + " " + hebMonthName;
	fullDate = fullDate + ", " + hYearStr;
	return fullDate;
}

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

bot.dialog('/', function (session) {
    if (session.message.text == "date")
    {
		var uDate = new Date();
		var tday = uDate.getDate();
		var tmonth = uDate.getMonth() + 1;
		var tyear = uDate.getFullYear();

		var hebDate = kdate.civ2heb_v1(tday, tmonth, tyear);
		var currentData = hebDateToString(hebDate);
		var data = {text: currentData, bot: "hcalendar-bot"};
    } else
    {
        // session.send('You said ' + session.message.text);
    }
});

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
