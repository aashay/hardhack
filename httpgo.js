var http = require('http');
var express = require('express');
var app = express();

var bart = require('bart').createClient();
var flite = require('flite')

var serlcd = require('serlcd');
var lcd = new serlcd();

var STATION_STRING = "dbrk south";


function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

var handleEstimates = function(estimates){
    
    //Sort by minutes
    estimates = sortByKey(estimates, "minutes");
    
    var status1;
    if(estimates[0] && estimates[0].minutes <= 0){
       status1 = estimates[0].length + " car " + estimates[0].destination + " train now boarding platform " + estimates[0].platform;
    }else{
       status1 = estimates[0].length + " car " + estimates[0].destination + " train in " + estimates[0].minutes
           + (estimates[0].minutes > 1 ? " minutes." : " minute.");
    }

    var status2;
    if(estimates[1] && estimates[1].minutes <= 0){
       status2 = estimates[1].length + " car " + estimates[1].destination + " train now boarding platform " + estimates[1].platform;
    }else{
       status2 = estimates[1].length + " car " + estimates[1].destination + " train in " + estimates[1].minutes
           + (estimates[1].minutes > 1 ? " minutes." : " minute.");
    }

    //Pronounce things properly and dont say 'slash'!
    status1 = status1.replace(/SFO/ig, "S.F.O").replace(/\//ig," ");
    status2 = status2.replace(/SFO/ig, "S.F.O").replace(/\//ig," ");

    //Spit out the status lines to the console
    console.log(status1);
    console.log(status2);
    console.log();

    //Say stuff
    flite({voice: 'slt'},function (err, speech) {
       speech.say(status1, function (err) {
           if (err) console.error(err);
           setTimeout(function(){
               speech.say(status2, function (err) {
                   if (err) console.error(err);
               });
           },1000);
        });
    });

    //Write to LCD, substring 0,12 to keep enough room
    lcd.clearScreen();
    var line1 = estimates[0].destination.substring(0,12) + " " + (estimates[0].minutes || "BRD");
    var line2 = estimates[1].destination.substring(0,12) + " " + (estimates[1].minutes || "BRD"); //BRD for "boarding" to keep it short

    lcd.writeTopLine(line1);
    lcd.writeBottomLine(line2);

};

lcd.clearScreen();
bart.on(STATION_STRING, handleEstimates);

app.get('/', function(req, res){
  res.send('BART thing listening to ' + STATION_STRING);
});

app.get('/station/:stationstring', function(req,res){        
    var stationstring = req.params.stationstring.replace("%20", " ").toLowerCase();
    console.log("Switching to " + stationstring);
    bart.emitter.removeAllListeners();
    STATION_STRING = stationstring;
    process.nextTick(function(){
        bart.on(STATION_STRING, handleEstimates);
    });    
    res.send('Ok, now listening to ' + stationstring);    
});

app.listen(1337);


bart.on('error', function(err){
   lcd.clearScreen();
   lcd.writeTopLine("No train data");
   console.log("Got an error, probably no more train data");
   process.exit();
});

console.log("Running BART thing, listening to " + STATION_STRING + "...");
