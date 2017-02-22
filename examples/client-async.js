
var fs = require('fs');
var path = require('path');
var ViconClient = require('vicon-utils').ViconClientAsync;

var client = new ViconClient("C:/Program Files/Vicon/DataStream SDK/Win64/dotNET/ViconDataStreamSDK_DotNET.dll");

client.connect("localhost", 801, (err, res) => {
    if (err) throw err;
    console.log('connected');
    client.setMarkerNames(['mT1','mT2']);
    client.setViconModelName('Spec57-14');
    client.setNewFrameCallback((err, data) => {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
        }
    })
    client.startListening();
    console.log('started listening');
    setTimeout(() => {
        client.stopListening();
        console.log('stopped listening');
    }, 2000)
    setTimeout(() => {
        client.startListening();
        console.log('started listening');
    }, 4000)
    setTimeout(() => {
        client.stopListening();
        console.log('stopped listening');
    }, 6000)
});
console.log('connecting');
