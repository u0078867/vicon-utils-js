
var ViconRemoteTrigger = require('vicon-utils').ViconRemoteTrigger;

var host = '255.255.255.255';
var trigger = new ViconRemoteTrigger(host, 30);

trigger.createUDPClient();

trigger.setFilePath('C:\\Tmp\\'); // For Nexus < 2, it seems not to have influence

var to = setTimeout(function() {
    trigger.setFileName('Test 01');
    trigger.sendStart();
}, 2000);

var to = setTimeout(function() {
    trigger.sendStop();
}, 4000);

var to = setTimeout(function() {
    trigger.setFileName('Test 02');
    trigger.sendStart();
}, 6000);

var to = setTimeout(function() {
    trigger.sendStop();
}, 8000);

var to = setTimeout(function() {
    trigger.destroyUDPClient();
}, 10000);
