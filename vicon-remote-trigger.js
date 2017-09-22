
var dgram = require('dgram');
var util = require('util');


var msgStart = '\
<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n\
<CaptureStart>\n\
  <Name VALUE="%s"/>\n\
  <Notes VALUE=""/>\n\
  <Description VALUE="Captured automatically"/>\n\
  <DatabasePath VALUE="%s"/>\n\
  <Delay VALUE="0"/>\n\
  <PacketID VALUE="%d"/>\n\
</CaptureStart>\n\0\
';

var msgStop = '\
<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n\
<CaptureStop RESULT="SUCCESS">\n\
  <Name VALUE="%s"/>\n\
  <DatabasePath VALUE="%s"/>\n\
  <Delay VALUE="0"/>\n\
  <PacketID VALUE="%d"/>\n\
</CaptureStop>\n\0\
';

/* NOTE:
Nexus does not like at all UDP packages with the same ID, so an incremental
number has to be provided. The best way is to be able to instantiate the class
with a default number (to be later incremented by start/stop packages) tha is
already different than all the possible ones used before. Than a good thing
would be to have this number proportional to the current time. However, using
barely Date.now() would produce a too large number (1E13), representing ms
since a specific ephoc. Vicon does not tolerate package numbers higher than
1E10. As a safety factor, I will only use 8 digits. Giving their meaning,
I have a time buffer of 99999 seconds before having to re-instantiate a new
ViconRemoteTrigger class. 99999 / 3600 = 27.8 hours of consecutive measures,
that sounds very fair.
*/
function generateID() {
    return parseInt(Date.now().toString().slice(-9));
}



function ViconRemoteTrigger(host, port) {

    this.host = host || '127.0.0.1';
    this.port = port || 30;
    this.client = null;
    this.packetID = generateID();
    this.filePath = null;
    this.fileName = null;

    this.createUDPClient = function() {
        this.client = dgram.createSocket('udp4');
        console.log('UDP client created');
        this.client.bind(function() { this.client.setBroadcast(true) }.bind(this) );
    };

    this.getPacketID = function() {
        return this.packetID;
    }

    this.setPacketID = function(packetID) {
        this.packetID = packetID;
    }

    this.getFilePath = function() {
        return this.getFilePath;
    }

    this.setFilePath = function(filePath) {
        this.filePath = filePath;
    }

    this.getFileName = function() {
        return this.fileName;
    }

    this.setFileName = function(fileName) {
        /* NOTE:
        If this is set to an already existing file name, Nexus will disable
        the "Start" capture button, at the moment of receiving the start
        package, without capturing anything. Setting manualy the file name in
        Nexus to a non-existing one will fix the problem. 
        */
        this.fileName = fileName;
    }

    this.sendStart = function() {
        this.packetID++;
        var msg = util.format(msgStart, this.fileName, this.filePath, this.packetID);
        var message = new Buffer(msg);
        this.client.send(message, 0, message.length, this.port, this.host, function(err, bytes) {
            if (err) throw err;
            console.log('UDP start message sent to ' + this.host +':'+ this.port);
            console.log(msg);
        }.bind(this));
    };

    this.sendStop = function() {
        this.packetID++;
        var msg = util.format(msgStop, this.fileName, this.filePath, this.packetID);
        var message = new Buffer(msg);
        this.client.send(message, 0, message.length, this.port, this.host, function(err, bytes) {
            if (err) throw err;
            console.log('UDP stop message sent to ' + this.host +':'+ this.port);
            console.log(msg);
        }.bind(this));
    };

    this.destroyUDPClient = function() {
        this.client.close();
        this.client = null;
        console.log('UDP client destroyed');
    };

}


module.exports = ViconRemoteTrigger;
