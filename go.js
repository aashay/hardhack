var bart = require('bart').createClient();
var flite = require('flite')

var serlcd = require('serlcd');
var lcd = new serlcd();

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

lcd.clearScreen();
bart.on('powl south', function(estimates){
    
    //Sort by minutes
    estimates = sortByKey(estimates, "minutes");
    
    var status1;
    if(estimates[0].minutes <= 0){
       status1 = estimates[0].length + " car " + estimates[0].destination + " train now boarding platform " + estimates[0].platform;
    }else{
       status1 = estimates[0].length + " car " + estimates[0].destination + " train in " + estimates[0].minutes
           + (estimates[0].minutes > 1 ? " minutes." : " minute.");
    }

    var status2;
    if(estimates[1].minutes <= 0){
       status2 = estimates[1].length + " car " + estimates[1].destination + " train now boarding platform " + estimates[1].platform;
    }else{
       status2 = estimates[1].length + " car " + estimates[1].destination + " train in " + estimates[1].minutes
           + (estimates[1].minutes > 1 ? " minutes." : " minute.");
    }

    //Pronounce things properly!
    status1 = status1.replace(/SFO/ig, "S.F.O");
    status2 = status2.replace(/SFO/ig, "S.F.O");

    //Spit out the status lines to the console
    console.log(status1);
    console.log(status2);
    console.log();

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

});

bart.on('error', function(err){
   lcd.clearScreen();
   lcd.writeTopLine("No train data");
   console.log("Got an error, probably no more train data");
   process.exit();
});

console.log("Running BART thing...");
