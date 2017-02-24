
var edge = require('edge');
var path = require('path');

function ViconClientSync(pathViconDataStreamSDK) {

    // the properties initialized with undefined are necessary.

    this.server = undefined;
    this.port = undefined;
    this.client = undefined;
    this.listening = false;
    this.callback = ((data) => {});

    this.pathViconDataStreamSDK = pathViconDataStreamSDK;
    this.Tc = 2;
    this.viconModelName = undefined;
    this.markerNames = undefined;

    // Instantiate the client creator
    var createViconClient = edge.func({
        source: path.join(__dirname, 'vicon.cs'),
        references: [
            this.pathViconDataStreamSDK
        ],
    });

    this.connect = function(server, port) {
        this.server = server || 'localhost';
        this.port = port || 801;
        this.client = createViconClient(null, true);
        this.client.connect(this.server  + ':' + this.port, true);
        this.client.enableMarkerData(null, true);
    };

    this.setNewFrameCallback = function(callback) {
        this.callback = callback;
    };

    var getData = () => {
        var preReturnFunc = () => {setTimeout(getData, this.Tc)};
        // Wait for new frame
        this.client.getFrameWhenAvailable(null, true);
        // Get frame number
        var frameNumber = parseInt(this.client.getFrameNumber(null, true));
        if (this.markerNames == undefined) {
            preReturnFunc();
            return;
        }
        if (this.viconModelName == undefined) {
            preReturnFunc();
            return;
        }
        // Get frame data
        var markerData = {};
        for (var i = 0; i < this.markerNames.length; i++) {
            var marker = this.client.getMarkerGlobalTranslation({subject: this.viconModelName, marker: this.markerNames[i]}, true);
            markerData[this.markerNames[i]] = [marker.x, marker.y, marker.z];
        }
        // Send data to callback
        var data = {};
        data.frameNumber = frameNumber;
        data.markerData = markerData;
        data.from = 'Vicon';
        this.callback(data);
        preReturnFunc();
    };

    this.startListening = function() {
        if (this.isListening()) {
            this.stopListening();
        }
        this.getDataLoop = setTimeout(getData, this.Tc);
        this.listening = true;
    };

    this.stopListening = function() {
        if (this.isListening()) {
            clearTimeout(this.getDataLoop);
            this.listening = false;
        }
    };

    this.isListening = function() {
        return this.listening;
    };

    this.setViconModelName = function(viconModelName) {
        this.viconModelName = viconModelName;
    };

    this.setMarkerNames = function(markerNames) {
        this.markerNames = markerNames;
    };

    this.setTc = function(Tc) {
        this.Tc = Tc;
    }

}


module.exports = ViconClientSync;
