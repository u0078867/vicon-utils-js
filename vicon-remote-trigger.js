
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



function ViconRemoteTrigger(host, port) {

    this.host = host || '127.0.0.1';
    this.port = port || 30;
    this.client = null;
    this.packetID = 0;
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
