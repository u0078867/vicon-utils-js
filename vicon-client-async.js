
var edge = require('edge');
var path = require('path');

function ViconClientAsync(pathViconDataStreamSDK) {

    // the properties initialized with undefined are necessary.

    this.server = undefined;
    this.port = undefined;
    this.client = undefined;
    this.listening = false;
    this.callback = ((data) => {});

    this.pathViconDataStreamSDK = pathViconDataStreamSDK;
    this.Tc = 16;   // leave it like this, as for 60Hz (Vicon cannot go any faster in streaming data outside)
    this.viconModelName = undefined;
    this.markerNames = undefined;

    // Instantiate the client creator
    var createViconClient = edge.func({
        source: path.join(__dirname, 'vicon.cs'),
        references: [
            this.pathViconDataStreamSDK
        ],
    });

    this.connect = function(server, port, cb) {
        var onError = (err) => {cb(err)}
        this.server = server || 'localhost';
        this.port = port || 801;
        this.client = createViconClient(null, true);
        var connect = (url) => {
            return new Promise((resolve, reject) => {
                this.client.connect(url, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                })
            })
        }
        var enableMarkerData = () => {
            return new Promise((resolve, reject) => {
                this.client.enableMarkerData(null, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                })
            })
        }
        connect(this.server  + ':' + this.port)
        .then(enableMarkerData)
        .then(() => cb())
        .catch(err => cb(err))
    };

    this.setNewFrameCallback = function(callback) {
        this.callback = callback;
    };



    var getData = () => {
        var preReturnFunc = () => {
            this.getDataLoop = setTimeout(getData, this.Tc)
        };
        var getFrame = () => {
            return new Promise((resolve, reject) => {
                this.client.getFrameIfAvailable(null, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (res) {
                            resolve();
                        } else {
                            reject('No new frame');
                        }
                    }
                })
            })
        }
        var getFrameNumber = () => {
            return new Promise((resolve, reject) => {
                this.client.getFrameNumber(null, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                })
            })
        }
        var getMarker = (subjectName, markerName) => {
            return new Promise((resolve, reject) => {
                this.client.getMarkerGlobalTranslation({subject: subjectName, marker: markerName}, (err, res) => {
                    if (err) reject(err);
                    var marker = {};
                    marker[markerName] = [res.x, res.y, res.z];
                    resolve(marker)
                });
            })
        }

        getFrame()
        .then(getFrameNumber)
        .then(res => {
            frameNumber = parseInt(res);
            // Get markers
            if (this.markerNames == undefined) {
                throw 'Marker names array is undefined'
            }
            if (this.viconModelName == undefined) {
                throw 'Subject name is undefined'
            }
        })
        .then(() => {
            var arr = [];
            for (m of this.markerNames) {
                arr.push(getMarker(this.viconModelName, m));
            }
            return Promise.all(arr)
        })
        .then(markers => {
            var markerData = {};
            for (m of markers) {
                var markerName = Object.keys(m)[0];
                markerData[markerName] = m[markerName];
            }
            var data = {};
            data.frameNumber = frameNumber;
            data.markerData = markerData;
            data.from = 'Vicon';
            this.callback(undefined, data);
            preReturnFunc();
        })
        .catch(err => {
            this.callback(err);
            preReturnFunc();
        })
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

}


module.exports = ViconClientAsync;
