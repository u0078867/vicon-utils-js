
var edge = require('edge');
var path = require('path');

function ViconClientAsync(pathViconDataStreamSDK, options={}) {

    // define private and public methods

    this.connect = (server, port, cb) => {
        var onError = (err) => {cb(err)}
        this._server = server || 'localhost';
        this._port = port || 801;
        var create = () => {
            return new Promise((resolve, reject) => {
                createViconClient(null, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        this._client = res;
                        resolve(res);
                    }
                })
            })
        }
        var connect = (url) => {
            return new Promise((resolve, reject) => {
                this._client.connect(url, (err, res) => {
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
                this._client.enableMarkerData(null, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                })
            })
        }
        create()
        .then(() => connect(this._server  + ':' + this._port))
        .then(enableMarkerData)
        .then(() => cb())
        .catch(err => cb(err))
    };

    this.setNewFrameCallback = (callback) => {
        this._callback = callback;
    };

    this.setDataPollType = (dataPollType) => {
        this._dataPollType = dataPollType;
        this._setPreReturnFunc();
    }

    this._setPreReturnFunc = () => {
        switch (this._dataPollType) {
            case 'interval':
                this._preReturnFunc = () => {
                    this._getDataLoop = setTimeout(this._getData, this._Tc);
                }
                break;
            case 'pull':
                this._preReturnFunc = () => {};
                break;
        }
    }

    this._unsetPreReturnFunc = () => {
        switch (this._dataPollType) {
            case 'interval':
                clearTimeout(this._getDataLoop);
                break;
        }
    }

    this._getData = () => {
        var getFrame = () => {
            return new Promise((resolve, reject) => {
                this._client.getFrameIfAvailable(null, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (res) {
                            resolve();
                        } else {
                            //reject(new Error('No new frame'));
                            reject('No new frame');
                        }
                    }
                })
            })
        }
        var getFrameNumber = () => {
            return new Promise((resolve, reject) => {
                this._client.getFrameNumber(null, (err, res) => {
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
                this._client.getMarkerGlobalTranslation({subject: subjectName, marker: markerName}, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            })
        }

        var getAllMarkers = () => {
            return new Promise((resolve, reject) => {
                this._client.getAllMarkersGlobalTranslation(null, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            })
        }

        getFrame()
        .then(getFrameNumber)
        .then(res => {
            frameNumber = parseInt(res);
        })
        .then(() => {
            // Get markers
            if (this._filterMarkers) {
                if (this._markerNames == undefined) {
                    throw new Error('Marker names array is undefined')
                }
                if (this._viconModelName == undefined) {
                    throw new Error('Subject name is undefined')
                }
                var arr = [];
                for (m of this._markerNames) {
                    arr.push(getMarker(this._viconModelName, m));
                }
                return Promise.all(arr);
            } else {
                return getAllMarkers();
            }
        })
        .then(markers => {
            var markerData = {};
            for (m of markers) {
                if (!m.occluded) {
                    markerData[m.label] = [m.x, m.y, m.z];
                }
            }
            var data = {};
            data.frameNumber = frameNumber;
            data.markerData = markerData;
            if (Object.keys(markerData).length == 0) {
                throw 'No marker data';
            }
            data.from = 'Vicon';
            this._callback(undefined, data, this);
            this._preReturnFunc();
        })
        .catch(err => {
            this._callback(err, undefined, this);
            this._preReturnFunc();
        })
    };

    this.requestFrame = () => {
        this._getData();
    }

    this.startListening = () => {
        if (this.isListening()) {
            this.stopListening();
        }
        this._unsetPreReturnFunc();
        this._setPreReturnFunc();
        this.requestFrame();
        this._listening = true;
    };

    this.stopListening = () => {
        if (this.isListening()) {
            this._unsetPreReturnFunc();
            this._listening = false;
        }
    };

    this.isListening = () => {
        return this._listening;
    };

    this.setViconModelName = (viconModelName) => {
        this._viconModelName = viconModelName;
    };

    this.setMarkerNames = (markerNames) => {
        this._markerNames = markerNames;
    };

    // define properties

    this._server = undefined;
    this._port = undefined;
    this._client = undefined;
    this._listening = false;
    this._callback = ((data) => {});
    this._type = 'ViconAsync';

    this._pathViconDataStreamSDK = pathViconDataStreamSDK;
    this._Tc = options.Tc || 20;
    this._filterMarkers = (options.filterMarkers == undefined) ? true : options.filterMarkers;
    this._viconModelName = undefined;
    this._markerNames = undefined;

    this.setDataPollType(options.dataPollType || 'interval');

    // Instantiate the client creator
    var createViconClient = edge.func({
        source: path.join(__dirname, 'vicon.cs'),
        references: [
            this._pathViconDataStreamSDK
        ],
    });

}


module.exports = ViconClientAsync;
