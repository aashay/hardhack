var bart = require('bart').createClient();
var flite = require('flite')

var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyUSB0");

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function clearScreen(){
    var b = new Buffer([0xFE, 0x01]);
    serialPort.write(b);
}

function clearAndWrite(msg){
    clearScreen();
    setTimeout(function(){
        serialPort.write(msg);
    }, 50);
}

function writeTopLine(line){
    line = line.substring(0,16);  //Truncate

    setTimeout(function(){
        serialPort.write(new Buffer([0xFE, 0x80])); //0x80 sets cursor to first position of first line
        serialPort.write(line);
    }, 100); //If you write it too fast it won't write!
}

function writeBottomLine(line){
    line = line.substring(0,16);  //Truncate

    setTimeout(function(){
        serialPort.write(new Buffer([0xFE, 0xC0])); //0xC0 sets cursor to first position of second line
        serialPort.write(line);
    }, 120);
}

clearScreen();
bart.on('dbrk south', function(estimates){
    
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

    //Write to LCD
    clearScreen();
    var line1 = estimates[0].destination + " " + (estimates[0].minutes || "BRD");
    var line2 = estimates[1].destination + " " + (estimates[1].minutes || "BRD"); //BRD for "boarding" to keep it short

    writeTopLine(line1);
    writeBottomLine(line2);

});
