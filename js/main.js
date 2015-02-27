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

    if(!hvacIndicator)
    {
        hvacIndicator = new hvacController();
        setup_ui();
    }
};

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
			hvacIndicator.status.targetTemperatureLeft = newVal;
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
			hvacIndicator.status.targetTemperatureRight = newVal;
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
			hvacIndicator.status.fanSpeed = $(this).val();
	    	hvacIndicator.onFanSpeedChanged($(this).val());

	    }
	});
/*
    carIndicator.addListener({
	    onAirRecirculationChanged : function(newValue) {
		hvacIndicator.onAirRecirculationChanged(newValue);
	    },
	    onFanChanged : function(newValue) {
		hvacIndicator.onFanChanged(newValue);
	    },
	    onFanSpeedChanged : function(newValue) {
		hvacIndicator.onFanSpeedChanged(newValue);
	    },
	    onTargetTemperatureRightChanged : function(newValue) {
		hvacIndicator.onTargetTemperatureRightChanged(newValue);
	    },
	    onTargetTemperatureLeftChanged : function(newValue) {
		hvacIndicator.onTargetTemperatureLeftChanged(newValue);
	    },
	    onHazardChanged : function(newValue) {
		hvacIndicator.onHazardChanged(newValue);
		console.log("onHazardChanged: "+ newValue);
	    },
	    onSeatHeaterRightChanged : function(newValue) {
		hvacIndicator.onSeatHeaterRightChanged(newValue);
	    },
	    onSeatHeaterLeftChanged : function(newValue) {
		hvacIndicator.onSeatHeaterLeftChanged(newValue);
	    },
	    onAirflowDirectionChanged : function(newValue) {
		hvacIndicator.onAirflowDirectionChanged(newValue);
	    },
	    onFrontDefrostChanged : function(newValue) {
		hvacIndicator.onFrontDefrostChanged(newValue);
	    },
	    onRearDefrostChanged : function(newValue) {
		hvacIndicator.onRearDefrostChanged(newValue);
	    }
	});
*/
}


/**
 * Calls initialization fuction after document is loaded.
 * @method $(document).ready
 * @param init {function} Callback function for initialize Store.
 * @static
 **/
$(document).ready(init_hvac);