Vicon (optoelectronic system, <http://www.vicon.com/>) utilities for Node.js.

Features:

- start/stop data capture on remote software trigger (see `examples/vicon-remote-trigger.js`). First, set Nexus to listen to start/stop over a network in the Capture panel (interface 255.255.255.255:30);

- read streaming data from Vicon Nexus (see `examples/client-async.js`). In Nexus, subject model must be attached;
