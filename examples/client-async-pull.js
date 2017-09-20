
var fs = require('fs');
var path = require('path');
var ViconClient = require('vicon-utils').ViconClientAsync;

var client = new ViconClient("C:/Program Files/Vicon/DataStream SDK/Win64/dotNET/ViconDataStreamSDK_DotNET.dll", {
    filterMarkers: false,
    dataPollType: 'pull',
});

console.log('connecting ...');
client.connect('localhost', 801, function (err, res) {
    if (err) throw err;
    console.log('connected');
    client.setMarkerNames(['mT1','mT2']);
    client.setViconModelName('Spec57-14');
    client.setNewFrameCallback((err, data, _client) => {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
        }
        setTimeout(() => {  // timeout simulating some computations
            _client.requestFrame();
        }, 16);
    });
    client.requestFrame();
    /*setInterval(() => {
        client.requestFrame();
    }, 16);*/
})
