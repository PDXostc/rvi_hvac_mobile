/* Copyright (C) Jaguar Land Rover - All Rights Reserved
*
* Proprietary and confidential
* Unauthorized copying of this file, via any medium, is strictly prohibited
*
* THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
* KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
* PARTICULAR PURPOSE.
*
* Filename:	 header.txt
* Version:              1.0
* Date:                 January 2013
* Project:              Widget incorporation
* Contributors:         XXXXXXX
*                       xxxxxxx
*
* Incoming Code:        GStreamer 0.93, <link>
*
*/


/**
 * Initialize application components and register button events.
 *
 * @method init
 * @static
 */
var hvacIndicator;
var init_hvac = function () {
	console.log("init_hvac()");


	if(localStorage['mobileVin'] == undefined){
		localStorage['mobileVin'] = generateID(10);
	}

    if(!hvacIndicator)
    {
        hvacIndicator = new hvacController();
        setup_ui();
    }

    rvi = new RVI();
    rvi.connect("ws://rvi-test1.nginfotpdx.net:8808/websession",function(e){console.log(e)});
    //rvi.connect("ws://rvi1.nginfotpdx.net:8808/websession",function(e){console.log(e)});
	registerMobileServices();
};

//Generate a random Id for use with this mobile implementation. Will be stored in localStorage.
function generateID(len){
	var valid = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var newId = "";
	for(var i=0; i < len; i++){
		newId += valid.charAt(Math.floor(Math.random() * valid.length));
	}
	return newId;
}


function setup_ui() {
    console.log("setup_ui() called!");
	$(".noUiSliderLeft").noUiSlider({
	    range : [ 0, 14 ],
	    step : 1,
	    start : 14,
	    handles : 1,
	    connect : "upper",
	    orientation : "vertical",
	    slide : function() {
			if ($("#defrost_max_btn").hasClass("on")) {
			    switch ($(this).val()) {
			    case 0:
				$(this).val(1);
				break;
			    case 14:
				$(this).val(13);
				break;
			    }
			}

			var newVal = ($(this).val() + 29) - ($(this).val() * 2);
			sendRVI("hvac/temp_left",newVal);
			hvacIndicator.onTargetTemperatureLeftChanged(newVal);
	    }
	});

	$(".noUiSliderRight").noUiSlider({
	    range : [ 0, 14 ],
	    step : 1,
	    start : 14,
	    handles : 1,
	    connect : "upper",
	    orientation : "vertical",
	    slide : function() {

			var newVal = ($(this).val() + 29) - ($(this).val() * 2);
			sendRVI("hvac/temp_right",newVal);
			hvacIndicator.onTargetTemperatureRightChanged(newVal);
	    }
	});

	$(".noUiSliderFan").noUiSlider({
		range : [ 0, 7 ],   // Even though this is defined as 4 bits the car does 0..7
	    step : 1,
	    start : 0,
	    handles : 1,
	    connect : "upper",
	    orientation : "horizontal",
	    slide : function() {
			sendRVI("hvac/fan_speed",$(this).val());
	    	hvacIndicator.onFanSpeedChanged($(this).val());

	    }
	});
}

function setVin(vinValue){
	localStorage['rviVin'] = vinValue;
	subscribeToVin(localStorage['rviVin']);
	return true;
}

function sendRVI(key, value){

	if(localStorage['rviVin'] == undefined){
		console.log("No rviVin defined");
		return false;
	}

    value = JSON.stringify({value:value.toString(),sending_node:"jlr.com/backend/"+localStorage['mobileVin']+"/" });
    service = "jlr.com/vin/" + localStorage['rviVin']+"/" +key;

    console.log("Service:" + key);
    console.log("Val: " + value );
    rvi.send_message(service, 5000, value, key);
}

//Pass the mobile identifier to a TizenBox
function subscribeToVin(){
	node = "jlr.com/backend/" + localStorage['mobileVin']+"/";
	sendRVI("hvac/subscribe",JSON.stringify({"node":node}));

}

function unsubscribeToVin(){
	sendRVI("hvac/unsubscribe",true);
}


/*
	Registers client with RVI
*/
function registerMobileServices(){

	hvacServices = [
		{"name":"hvac/air_circ","callback":aircirc_rcb},
		{"name":"hvac/fan","callback":fan_rcb},
		{"name":"hvac/fan_speed","callback":fanspeed_rcb},
		{"name":"hvac/temp_left","callback":temp_left_rcb},
		{"name":"hvac/temp_right","callback":temp_right_rcb},
		{"name":"hvac/hazard","callback":hazard_rcb},
		{"name":"hvac/seat_heat_right","callback":seat_heat_right_rcb},
		{"name":"hvac/seat_heat_left","callback":seat_heat_left_rcb},
		{"name":"hvac/airflow_direction","callback":airflow_direction_rcb},
		{"name":"hvac/defrost_rear","callback":defrost_rear_rcb},
		{"name":"hvac/defrost_front","callback":defrost_front_rcb},
		{"name":"hvac/defrost_max","callback":defrost_max_rcb}
	];

	for(serviceName in hvacServices){
		rvi.register_service(localStorage['mobileVin']+"/"+hvacServices[serviceName].name,hvacServices[serviceName].callback);
		console.log("Registered callback `"+hvacServices[serviceName].callback+"` for "+hvacServices[serviceName].name);
	}
}

function aircirc_rcb(args) {
	hvacIndicator.onAirRecirculationChanged(args['value']);
}

function fan_rcb(args) {
	hvacIndicator.onFanChanged(args['value']);
}

function hazard_rcb(args) {
	hvacIndicator.onHazardChanged(args['value']);
}

function fanspeed_rcb(args){
	hvacIndicator.onFanSpeedChanged(Number(args['value']));
}

function temp_left_rcb(args){
	//carIndicator.setStatus("seatHeaterRight", parseInt(args.value));
	//hvacController.prototype.onSeatHeaterRightChanged(Number(args['value']));
	hvacIndicator.onTargetTemperatureLeftChanged(Number(args['value']));
}

function temp_right_rcb(args){
	//carIndicator.setStatus("seatHeaterRight", parseInt(args.value));
	//hvacController.prototype.onSeatHeaterRightChanged(Number(args['value']));
	hvacIndicator.onTargetTemperatureRightChanged(Number(args['value']));
}

function seat_heat_right_rcb(args){
	//carIndicator.setStatus("seatHeaterRight", parseInt(args.value));
	hvacIndicator.onSeatHeaterRightChanged(Number(args['value']));
}

function seat_heat_left_rcb(args){
	//carIndicator.setStatus("seatHeaterRight", parseInt(args.value));
	hvacIndicator.onSeatHeaterLeftChanged(Number(args['value']));
}

function defrost_rear_rcb(args) {
	hvacIndicator.onRearDefrostChanged(args['value']);
}

function defrost_front_rcb(args) {
	hvacIndicator.onFrontDefrostChanged(args['value']);
}

function defrost_max_rcb(args) {
	hvacIndicator.onMaxDefrostChanged(args['value']);
}

function airflow_direction_rcb(args){
	hvacIndicator.status.airflowDirection = Number(args['value']);
	hvacIndicator.onAirflowDirectionChanged(Number(args['value']));
}


/**
 * Calls initialization fuction after document is loaded.
 * @method $(document).ready
 * @param init {function} Callback function for initialize Store.
 * @static
 **/
$(document).ready(init_hvac);
