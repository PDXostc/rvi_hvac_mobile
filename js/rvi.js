/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/**
 * @module Services
 */

function RVI() {

    console.log("Starting up service RVI");
    RVI.instance = this;

    this.is_connected = false;
    this.trans_id = 1;
    this.service_map = {};

    this.OK = 0;
    this.NOT_CONNECTED = 1;
    this.on_service_available = function () {
    };
    this.on_service_unavailable = function () {
    };
    this.on_error = function () {
    };

    this.next_trans_id = function () {
        this.trans_id = this.trans_id + 1;
        return this.trans_id;
    };

    // Connect to an RVI node using
    // websockets
    this.connect = function (url) {
        if (this.is_connected)
            return;

        this.url = url;
        this.ws = new WebSocket(url);
        this.ws.onerror = this.on_error;
        this.ws.binaryType = "arraybuffer";
        this.ws.parent = this;

        this.ws.onopen = function (evt) {
            console.log("RVI connected to: " + this.url);

            this.parent.is_connected = true;

            // Register all services that have been
            // setup with register_service()
            for (svc in this.parent.service_map) {
                console.log("Will reg: " + JSON.stringify(svc));
                this.parent.register_service(svc, this.parent.service_map[svc].cb_fun)
            }
            // Invoke connect cb, if defined
            if (typeof this.parent.on_connect != "undefined")
                this.parent.on_connect(this.parent);
        };

        this.ws.close = function (evt) {
            console.log("RVI disconnected.");
            this.connected = false;
        };

        this.ws.onmessage = function (evt) {
            console.log("onmessage(): Got: " + JSON.stringify(evt));
            this.parent.dispatch_message(evt);
        };

        this.ws.onerror = this.on_error;
    };


    // Register a service.
    this.register_service = function (service, service_fun) {
        // Add a leading slash if necessar
        console.log("Registering service: " + service);
        if (service[0] != '/')
            service = '/' + service;

        // If we are not connected, then just update the
        // service map and return.
        // Once the connection goes through, we will register
        // all services
        if (!this.is_connected) {
            console.log("RVI: Deferring service registration: " + service);
            this.service_map[service] = {
                cb_fun: service_fun,
                full_name: undefined
            };
            return this.OK
        }

        console.log("RVI: Registering RVI service: " + service);
        console.log("RVI: Registering callback: " + service_fun);

        //
        // Redirect ws.onmessage to handle service registration replies
        //
        this.ws.onmessage = function (evt) {
            console.log("RVI: Register service result: " + JSON.parse(evt.data).service);

            // If this is a new service, set it up
            if (typeof this.parent.service_map[service] === "undefined") {
                this.service_map[service] = {
                    cb_fun: service_fun,
                    full_name: JSON.parse(evt.data).service
                };
            } else // Update full name of existing service.
                this.parent.service_map[service].full_name = JSON.parse(evt.data).service;


            // Reset the onmessage handler
            this.onmessage = function (evt) {
                this.parent.dispatch_message(evt);
            }
        };

        this.ws.send(JSON.stringify({
            'json-rpc': "2.0",
            'id': this.next_trans_id(),
            method: "register_service",
            params: {
                service_name: service
            }
        }));
        return this.OK;
    };

    // Unregister a service
    this.unregister_service = function (service) {
        if (service[0] != '/')
            service = '/' + service;

        if (!this.is_connected)
            return this.NOT_CONNECTED;

        console.log("RVI: unregistering: " + service);

        this.ws.send(JSON.stringify({
            'json-rpc': "2.0",
            'id': this.next_trans_id(),
            method: "unregister_service",
            params: {
                service_name: service
            }
        }));

        delete this.service_map[service];

        return this.OK;
    };


    this.disconnect = function () {
        if (!this.is_connected)
            return this.NOT_CONNECTED;

        this.ws.close(); // Server will unregister all services on its end
        return this.OK;
    };

    this.send_message = function (service, timeout, payload, cb) {
        console.log("RVI: message:  " + service);
        console.log("RVI: timeout:  " + timeout);
        console.log("RVI: params:   " + JSON.stringify(payload));
        console.log("RVI: callback: " + cb);

        // Redirect ws.onmessage to handle replies.

        if (!this.is_connected)
            return this.NOT_CONNECTED;

        this.ws.onmessage = function (evt) {
            console.log("RVI: message result: " + JSON.parse(evt.data).status);
            console.log("RVI: message TID: " + JSON.parse(evt.data).transaction_id);

            // Invoke provided callback
            //cb(JSON.parse(evt.data).result, JSON.parse(evt.data).transaction_id);

            // Reset the onmessage handler
            this.onmessage = function (evt) {
                this.parent.dispatch_message(evt);
            }
        };

        this.ws.send(JSON.stringify({
            'json-rpc': "2.0",
            'id': this.next_trans_id(),
            method: "message",
            params: {
                service_name: service,
                timeout: timeout,
                parameters: payload,
            }
        }));
    };

    // Retrieve the full service name for a service
    this.get_full_service_name = function (local_service_name) {
        return this.service_name[local_service_name].full_name;
    };

    this.dispatch_message = function (evt) {
        dt = JSON.parse(evt.data);

        if (dt.method === "message") {
            svc = dt.params.service_name;
            parameters = dt.params.parameters;
            console.log("RVI: dispatch_message: " + JSON.stringify(dt));
            console.log("RVI: dispatch_message: " + svc);
            console.log("RVI: dispatch_message: " + parameters);

            // CHECK USE of window
            if (this.service_map[svc]) {
                // Original tizen code had
                // window[this.service_map[svc].cb_fun](parameters);
                this.service_map[svc].cb_fun(parameters);

            } else {
                console.warn("Service: " + svc + " not mapped to any callback. Ignore");
                console.log("Service: " + JSON.stringify(this.service_map));
            }

            console.log("RVI Message completed");
            return;
        }

        if (dt.method === "services_available") {
            console.log("RVI service_available");
            this.on_service_available(dt.params.services);
            return;
        }

        if (dt.method === "services_unavailable") {
            console.log("RVI service_unavailable");
            this.on_service_unavailable(dt.params.services);
            return;
        }
    }
}

//// "ws://10.0.0.36:1234/websession"
function message() {
	args = {};

    for (var i = 0; i < arguments.length; ++i) {
    	if(i%2 == 0){
    		args[arguments[i]] = arguments[i+1];
    	}
    }
    console.log("RVI message Arguments ");
    console.log(args);

    return rvi.rvi_message.apply(rvi,arguments);
}
