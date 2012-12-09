var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyUSB0");

//var serialPort = new SerialPort("/dev/tty.SLAB_USBtoUART");

var foo = true;
setInterval(function(){
    //msg = "Fremont       13";

    // if(foo > 3){
    //         foo = 0;
    //     }
    //     if(foo == 0){
    //         clearAndWrite("Nope")
    //     }else{
    //         if(foo == 1){
    //             clearAndWrite("40 percent");
    //         }else {
    //             clearAndWrite("73 percent");
    //         }
    //     }
    //     foo++;
    if(foo){
        clearScreen();
        writeBottomLine("Fremont 40");
    }else{
        clearScreen();
        writeTopLine("Millbrae 20")
    }
    foo = !foo;
}, 1500);


//Hex codes etc from http://www.sparkfun.com/datasheets/LCD/SerLCD_V2_5.PDF

function clearAndWrite(msg){
    clearScreen();
    setTimeout(function(){
        serialPort.write(msg);
    }, 100);
}

function writeTopLine(line){
    line = line.substring(0,16);  //Truncate
    serialPort.write(new Buffer([0xFE, 0x80])); //0x80 sets cursor to first position of first line
    setTimeout(function(){
        serialPort.write(line);
    }, 100); //If you write it too fast it won't write!
}

function writeBottomLine(line){
    line = line.substring(0,16);  //Truncate
    serialPort.write(new Buffer([0xFE, 0xC0])); //0xC0 sets cursor to first position of second line
    setTimeout(function(){
        serialPort.write(line);
    }, 100);
}

function backlightOff(){
     var b = new Buffer([0x7C, 0x80]);
     serialPort.write(b);
}

function backlight40(){
    var b = new Buffer([0x7C, 0x8C]); //0x8C is 140
    serialPort.write(b);
}

function backlight73(){
    var b = new Buffer([0x7C, 0x96]); //0x96 is 150
    serialPort.write(b);
}

function backlight100(){
    var b = new Buffer([0x7C, 0x9D]); //0x9D is 157
    serialPort.write(b);
}

function clearScreen(){
    var b = new Buffer([0xFE, 0x01]);
    serialPort.write(b);
}

