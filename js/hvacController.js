/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/*global bootstrap*/

/**
 * Class provides methods to fill the content of HVAC's UI.
 * @class hvacController
 * @module HVACApplication
 */
var hvacController = function () {
	"use strict";
	this.initButtons();

};

/**
 * Holds statuses of connected buttons when turning Auto AC button ON.
 * @property autoACStatus {Object}
 */
var autoACStatus = {
	fanSpeed: 0,
	airflowDirection: 0,
	fan: false,
	airRecirculation: false,
	targetTemperatureRight: 0,
	targetTemperatureLeft: 0,
	maxDefrost: false
};

/**
 * Holds hazard timer object.
 * @property hazardTimer {Object}
 */
var hazardTimer;

/**
 * Holds interval value for hazard timer in ms.
 * @property hazardTimerInterval {Integer}
 * @default 500 mSec
 */
var hazardTimerInterval = 500;

/**
 * Implements hazard light blinking functionality.
 * @property hazardLight
 */
var hazardLight = {
	currentIndex: 1,
	change: function () {
		"use strict";
		if (hazardLight.currentIndex === 0) {
			$("#hazard_btn").removeClass("blink");
			hazardLight.currentIndex = 1;
			hazardLight.on();
		} else if (hazardLight.currentIndex === 1) {
			$("#hazard_btn").addClass("blink");
			hazardLight.currentIndex = 0;
			hazardLight.off();
		}
	},
	//  DirectionIndicationINST         0..3,
	//  UB_DirectionIndicationINST      0..1,
	//  DirectionIndicationMS           0..3,
	//  UB_DirectionIndicationMS        false/true,
	//  TrailerDirectionInd             0..1,
	//  UB_TrailerDirectionInd          0..1
	on: function () {
		//carIndicator.setStatus("DirectionIndicationINST",     3 );
		//carIndicator.setStatus("DirectionIndicationMS",       3 );
		// TODO: Missing translation for UB_DirectionIndicationINST and UB_DirectionIndicationMS
		//carIndicator.setStatus("UB_DirectionIndicationINST",  1 ); // this fails because no translation is set up...
		//tizen.vehicle.set("UB_DirectionIndicationINST", {uB_DirectionIndicationINST:true} );
		//carIndicator.setStatus("UB_DirectionIndicationMS",    1 ); // this fails because no translation is set up...
		//tizen.vehicle.set("UB_DirectionIndicationMS", {uB_DirectionIndicationMS:true} );
		// //carIndicator.setStatus("TrailerDirectionInd",      1 );
		// carIndicator.setStatus("UB_TrailerDirectionInd",   1 );
	},
	off: function () {
		// Lights OFF
		//carIndicator.setStatus("DirectionIndicationINST",     0 );
		//carIndicator.setStatus("DirectionIndicationMS",       0 );
		// TODO: Missing translation for UB_DirectionIndicationINST and UB_DirectionIndicationMS
		//carIndicator.setStatus("UB_DirectionIndicationINST",  1 ); // this fails because no translation is set up...
		//tizen.vehicle.set("UB_DirectionIndicationINST", {uB_DirectionIndicationINST:true} );
		//carIndicator.setStatus("UB_DirectionIndicationMS",    1 ); // this fails because no translation is set up...
		//tizen.vehicle.set("UB_DirectionIndicationMS", {uB_DirectionIndicationMS:true} );
		// carIndicator.setStatus("TrailerDirectionInd",         0 );
		// carIndicator.setStatus("UB_TrailerDirectionInd",      0 );
	}
};

/**
 * Changes the status of AirflowDirection.
 * @method changeAirflowDirectionStatus
 * @param button {Object} AirflowDirection button
 * @param currentStatus {Integer} current status of AirflowDirection
 * @param value {Integer} AirflowDirection button value
 * @return newStatus {Integer} a new status of AirflowDirection
 */
function changeAirflowDirectionStatus(button, currentStatus, value) {
	"use strict";
	var newStatus;
	if ($(button).hasClass("on") === true) {
		newStatus = currentStatus - value;
	} else {
		newStatus = currentStatus + value;
	}
	return newStatus;
}

/**
 * Toggles the SeatHeater button to its corresponding value.
 * @method toggleSeatHeaterButton
 * @param status {Integer} status to toggle the SeatHeater button to
 * @param button {Object} SeatHeater button to toggle
 */
function toggleSeatHeaterButton(status, button) {
	"use strict";
	// Setting SeatHeater button to OFF state
	if ($(button).hasClass("stage4")) {
		$(button).removeClass("stage4");
	}
	if ($(button).hasClass("stage3")) {
		$(button).removeClass("stage3");
	}
	if ($(button).hasClass("stage2")) {
		$(button).removeClass("stage2");
	}
	if (!$(button).hasClass("stage1")) {
		$(button).removeClass("stage1");
	}

	switch (status) {
		case 0:
			// Nothing to do as SeatHeater button was set to OFF state above
			$(button).addClass("stage1"); // (Button off!)
			break;
		case 1:
			$(button).addClass("stage2");
			break;
		case 3:
			$(button).addClass("stage3");
			break;
		case 5:
			$(button).addClass("stage4");
			break;
	}
}

/**
 * Toggles the button ON/OFF.
 * @method toggleButton
 * @param buttonStatus {Boolean|Integer} ON/OFF status of the button
 * @param button {Object} button to toggle ON/OFF
 */
function toggleButton(buttonStatus, button) {
	"use strict";
	// Note: Some signals do not return boolean values!
	if (buttonStatus === false || buttonStatus === "false" || buttonStatus == 0) {
		$(button).removeClass("on");
	} else {
		$(button).addClass("on");
	}
}

/**
 * Turns the Auto AC button OFF.
 * @method switchAutoACOff
 */
function switchAutoACOff() {
	"use strict";
	if ($("#fan_control_auto").hasClass("on")) {
		$("#fan_control_auto").removeClass("on");
	}
}

function switchAutoACOn() {
	"use strict";
	if (!$("#fan_control_auto").hasClass("on")) {
		$("#fan_control_auto").addClass("on");
	}
}

/**
 * Gets the TargetTemperature slider value depending on temperature.
 * @method getTargetTemperatureSliderValue
 * @param temperature {Integer} temperature in Celsius degrees
 * @return value {Integer} TargetTemperature slider value
 */
function getTargetTemperatureSliderValue(temperature) {
	"use strict";
	var value;
	if (temperature > 28) {
		value = 0;
		switchAutoACOff();
	} else if (temperature < 16) {
		value = 14;
		switchAutoACOff();
	} else {
		value = 14-(temperature%15);
	}
	return value;
}

/**
 * Sets AirflowDirection status to all the corresponding signals.
 * @method setAirFlowDirectionStatus
 * @param newStatus {Integer} a new AirflowDirection status value
 */
function setAirFlowDirectionStatus(newStatus) {
	hvacController.prototype.status.airflowDirection = newStatus;
	hvacController.prototype.status.FLHSDistrCmd = newStatus;
	hvacController.prototype.status.FRHSDistrCmd = newStatus;
}

/**
A status object for storing relevant properties.
**/
hvacController.prototype.status = {
	"SeatHeaterRight":0,
	"SeatHeaterLeft":0
}

/**
 * Sets the status of AirRecirculation button. Allows following values:
 *
 * * `true` - `ON` - also turns off Automatic AC mode
 * * `false` - `OFF`
 *
 * @method onAirRecirculationChanged
 * @param newStatus {Boolean} New status of AirRecirculation
 */
hvacController.prototype.onAirRecirculationChanged = function (newStatus) {
	"use strict";
	// Actual value of newStatus will be either 0 or 1...
	if (newStatus == true) {
		$("#fan_control_circ").addClass("on");
		switchAutoACOff();
	} else {
		$("#fan_control_circ").removeClass("on");
	}
};

/**
 * Sets the status of A/C button. Allows following values:
 *
 * * `true` - `ON`
 * * `false` - `OFF` - also turns off Automatic AC mode
 *
 * @method onFanChanged
 * @param newStatus {Boolean} New status of AirConditioning
 */
hvacController.prototype.onFanChanged = function (newStatus) {
	"use strict";
	if (newStatus === false || newStatus === "false") {
		$("#fan_control_ac").removeClass("on");
		switchAutoACOff();
	} else {
		$("#fan_control_ac").addClass("on");
	}
};

/**
 * Sets the status of FanSpeed button. Allows following values:
 *
 * * `0` = `OFF`
 * * `1` - `8` = sets fan speed to this value and also turns off Automatic AC mode
 *
 * @method onFanSpeedChanged
 * @param newStatus {Integer} new status of FanSpeed
 */
hvacController.prototype.onFanSpeedChanged = function (newStatus) {
	"use strict";

	$("#fanSpeedSlider").val(newStatus);
	$(".fanSpeedOn").css('width', parseInt($(".noUiSliderFan.horizontal.connect").find("a").css('left'), 10));
	if (newStatus === 0) {
		//carIndicator.setStatus("airflowDirection", 0);
	} else if (newStatus > 0) {
		switchAutoACOff();
	}
	hvacController.prototype.status.fanSpeed = newStatus;
};

/**
 * Sets the status of Right TargetTemperature slider and Right Temperature scrollable box.
 * Temperature can be set to following values:
 *
 * * below `16` - `LOW`, also turns off Automatic AC mode
 * * between `16` and `28` - exact temperature in Celsius degrees
 * * above `28` - `HIGH`, also turns off Automatic AC mode
 *
 * @method onTargetTemperatureRightChanged
 * @param newStatus {Integer} new status of Right TargetTemperature in Celsius degrees
 */
hvacController.prototype.onTargetTemperatureRightChanged = function (newStatus) {
	"use strict";
	var value = getTargetTemperatureSliderValue(newStatus);
	$("#noUiSliderRight").val(value);
	$(".scrollable.right").find(".temperature").stop(true, true).animate({
		"top": (-433 + (value * 33) + '%')
	});
	hvacController.prototype.status.targetTemperatureRight = value;
};

/**
 * Sets the status of Left TargetTemperature slider and Left Temperature scrollable box.
 * Temperature can be set to following values:
 *
 * * below `16` - `LOW`, also turns off Automatic AC mode
 * * between `16` and `28` - exact temperature in Celsius degrees
 * * above `28` - `HIGH`, also turns off Automatic AC mode
 *
 * @method onTargetTemperatureLeftChanged
 * @param newStatus {Integer} new status of Left TargetTemperature in Celsius degrees
 */
hvacController.prototype.onTargetTemperatureLeftChanged = function (newStatus) {
	"use strict";
	var value = getTargetTemperatureSliderValue(newStatus);
	$("#noUiSliderLeft").val(value);
	$(".scrollable.left").find(".temperature").stop(true, true).animate({
		"top": (-433 + (value * 33) + '%')
	});
	hvacController.prototype.status.targetTemperatureLeft = value;
};

/**
 * Sets the status of Hazard button. Blink interval of hazard light can be configured
 * using [hazardTimerInterval](../classes/hvacController.html#property_hazardTimerInterval).
 * @method onHazardChanged
 * @param newStatus {Boolean} new status of the Hazard
 */
hvacController.prototype.onHazardChanged = function (newStatus) {
	"use strict";
	if (newStatus === true || newStatus === "true") {
		$("#hazard_btn").addClass("on");

		// Each call to hazardlight.change will switch the on/off status of the lights.
		hazardTimer = setInterval(hazardLight.change, hazardTimerInterval);
	} else {

		// todo: This will stop the hazard lights callback BUT WON'T TURN OFF THE LIGHTS IF THEY ARE ON!
		clearInterval(hazardTimer);
		hazardLight.off();  // Turn off the lights used for hazards...
		hazardTimer = null;
		$("#hazard_btn").removeClass("on");
		if ($("#hazard_btn").hasClass("blink") === true) {
			$("#hazard_btn").removeClass("blink");
		}
	}
};

/**
 * Sets the status of Right SeatHeater button. Allows 4 levels of heating:
 *
 * * `0` - Off
 * * `1` - Low
 * * `2` - Normal
 * * `3` - High
 *
 * @method onSeatHeaterRightChanged
 * @param status {Integer} new status of Right SeatHeater
 */
hvacController.prototype.onSeatHeaterRightChanged = function (status) {
	"use strict";
	hvacController.prototype.status.SeatHeaterRight = status;
	toggleSeatHeaterButton(status, "#right_seat_btn_stage");
};

/**
 * Sets the status of Left SeatHeater button. Allows 4 levels of heating:
 *
 * * `0` - Off
 * * `1` - Low
 * * `2` - Normal
 * * `3` - High
 *
 * @method onSeatHeaterLeftChanged
 * @param status {Integer} new status of Left SeatHeater
 */
hvacController.prototype.onSeatHeaterLeftChanged = function (status) {
	"use strict";
	hvacController.prototype.status.SeatHeaterLeft = status;
	toggleSeatHeaterButton(status, "#left_seat_btn_stage");
};

/**
 * Sets the status of AirflowDirection buttons to one of the following values:
 *
 * * `1` - `FOOT`
 * * `2` - `FACE`
 * * `4` - `SCREEN` - when disabled Max defrost mode is turned off as well.
 *
 * Values can be combined, e.g. `3` is `FOOT` + `FACE`. If any of these values is
 * set Automatic AC mode is turned off.
 *
 * @method onAirflowDirectionChanged
 * @param newStatus {Integer} new status of the AirflowDirection
 */
hvacController.prototype.onAirflowDirectionChanged = function (newStatus) {
	"use strict";
	if ((newStatus >= 0) && (newStatus <= 7)) {

		if (newStatus === 7) {
			// Setting all the buttons to ON state
			if ($("#fan_dir_up_btn").hasClass("on") === false) {
				$("#fan_dir_up_btn").addClass("on");
			}
			if ($("#fan_dir_down_btn").hasClass("on") === false) {
				$("#fan_dir_down_btn").addClass("on");
			}
			if ($("#fan_dir_right_btn").hasClass("on") === false) {
				$("#fan_dir_right_btn").addClass("on");
			}
		} else {
			// Setting all the buttons to OFF state
			if ($("#fan_dir_up_btn").hasClass("on") === true) {
				$("#fan_dir_up_btn").removeClass("on");
			}
			if ($("#fan_dir_down_btn").hasClass("on") === true) {
				$("#fan_dir_down_btn").removeClass("on");
			}
			if ($("#fan_dir_right_btn").hasClass("on") === true) {
				$("#fan_dir_right_btn").removeClass("on");
			}
		}

		switch (newStatus) {
			// AUTO state when all the buttons are OFF
			case 0:
				// Nothing to do as all the buttons were set to OFF state above
				break;
			// FOOT ON
			case 1:
				$("#fan_dir_down_btn").addClass("on");
				break;
			// FACE ON
			case 2:
				$("#fan_dir_right_btn").addClass("on");
				break;
			// FOOT ON, FACE ON
			case 3:
				$("#fan_dir_down_btn").addClass("on");
				$("#fan_dir_right_btn").addClass("on");
				break;
			// SCREEN ON
			case 4:
				$("#fan_dir_up_btn").addClass("on");
				break;
			// FOOT ON, SCREEN ON
			case 5:
				$("#fan_dir_down_btn").addClass("on");
				$("#fan_dir_up_btn").addClass("on");
				break;
			// SCREEN ON, FACE ON
			case 6:
				$("#fan_dir_up_btn").addClass("on");
				$("#fan_dir_right_btn").addClass("on");
				break;
			// FOOT ON, FACE ON, SCREEN ON
			case 7:
				// Nothing to do as this option is handled above
				break;
		}

		// If SCREEN OFF, Max Defrost OFF
		if ((newStatus >= 0) && (newStatus <= 3)) {
			if ($("#defrost_max_btn").hasClass("on")) {
				$("#defrost_max_btn").removeClass("on");
			}
		}

		if (newStatus > 0) {
			switchAutoACOff();
		}
	}
};

/**
 * Sets the status of Rear Defrost button. Allows following values:
 *
 * * `true` - `ON`
 * * `false` - `OFF`
 *
 * @method onRearDefrostChanged
 * @param newStatus {Boolean} new status of the Rear Defrost
 */
hvacController.prototype.onRearDefrostChanged = function (newStatus) {
	"use strict";
	toggleButton(newStatus, "#defrost_rear_btn");
};

/**
 * Sets the status of Front Defrost button. Allows following values:
 *
 * * `true` - `ON`
 * * `false` - `OFF`
 *
 * @method onFrontDefrostChanged
 * @param newStatus {Boolean} new status of the Front Defrost
 */
hvacController.prototype.onFrontDefrostChanged = function (newStatus) {
	"use strict";
	toggleButton(newStatus, "#defrost_front_btn");
}

/**
 * Sets the status of Max Defrost button. Allows following values:
 *
 * * `true` - `ON`
 * * `false` - `OFF`
 *
 * @method onMaxDefrostChanged
 * @param newStatus {Boolean} new status of the Max Defrost
 */
hvacController.prototype.onMaxDefrostChanged = function (newStatus) {
	"use strict";
	toggleButton(newStatus, "#defrost_max_btn");
};

/**
 * HVAC buttons initialisation.
 * @method initButtons
 */
hvacController.prototype.initButtons = function () {
	"use strict";
	// Hazard
	$("#hazard_btn").bind('click', function () {
	    //carIndicator.status.hazard = !carIndicator.status.hazard;
	    console.log("hazard click: "+ carIndicator.status.hazard);

	    // -- Call onChanged() directly as the Hazard Flasher is really a virtual device.
	    //    onHazardChanged
	    hvacController.prototype.onHazardChanged(); //carIndicator.status.hazard
	});

	// A/C
	$("#fan_control_ac").bind('click', function () {
		//carIndicator.setStatus("Fan", !carIndicator.status.fan);
		//carIndicator.setStatus("ACCommand", !carIndicator.status.fan);
		hvacController.prototype.status.fan = !hvacController.prototype.status.fan;
		hvacController.prototype.status
	});
	// AUTO AC
	$("#fan_control_auto").bind('click', function () {
		if (!$("#fan_control_auto").hasClass("on")) {

			autoACStatus.fanSpeed = hvacController.prototype.status.fanSpeed;
			autoACStatus.airflowDirection = hvacController.prototype.status.airflowDirection;
			autoACStatus.fan = hvacController.prototype.status.fan;
			autoACStatus.airRecirculation = hvacController.prototype.status.airRecirculation;
			autoACStatus.targetTemperatureRight = hvacController.prototype.status.targetTemperatureRight;
			autoACStatus.targetTemperatureLeft = hvacController.prototype.status.targetTemperatureLeft;
			autoACStatus.maxDefrost = $("#defrost_max_btn").hasClass("on") ? true : false;

			if (autoACStatus.maxDefrost) {
				$("#defrost_max_btn").removeClass("on");
			}

			$("#fan_control_auto").addClass("on");
			hvacController.prototype.status.fanSpeed = 0;
			hvacController.prototype.onFanSpeedChanged(0);

			setAirFlowDirectionStatus(0);
			hvacController.prototype.status.Fan = true
			hvacController.prototype.status.ACComand = true;

			hvacController.prototype.onFanChanged(true);
			//carIndicator.setStatus("Fan", true);
			//carIndicator.setStatus("ACCommand", true);

			//carIndicator.setStatus("airRecirculation", false);
			//carIndicator.setStatus("RecircReq", 0);
			hvacController.prototype.status.airRecirculation = false;
			hvacController.prototype.status.RecircReq = 0;

			if (autoACStatus.targetTemperatureRight < 16 || autoACStatus.targetTemperatureRight > 28) {
				hvacController.prototype.onTargetTemperatureRightChanged(22);

				//carIndicator.setStatus("targetTemperatureRight", 22);
				//carIndicator.setStatus("FrontTSetRightCmd", 22);
			}
			if (autoACStatus.targetTemperatureLeft < 16 || autoACStatus.targetTemperatureLeft > 28) {
				hvacController.prototype.onTargetTemperatureLeftChanged(22);
				//carIndicator.setStatus("targetTemperatureLeft", 22);
				//carIndicator.setStatus("FrontTSetLeftCmd", 22);
			}
		} else {
			$("#fan_control_auto").removeClass("on");

   		    //carIndicator.setStatus("fanSpeed", autoACStatus.fanSpeed);
		    //carIndicator.setStatus("FrontBlwrSpeedCmd", autoACStatus.fanSpeed);

			setAirFlowDirectionStatus(autoACStatus.airflowDirection);


			//carIndicator.setStatus("Fan", autoACStatus.fan);
			//carIndicator.setStatus("ACCommand", autoACStatus.fan);

			//carIndicator.setStatus("airRecirculation", autoACStatus.airRecirculation);
			//carIndicator.setStatus("RecircReq", autoACStatus.airRecirculation ? 1 : 0);

			//carIndicator.setStatus("targetTemperatureRight", autoACStatus.targetTemperatureRight);
			//carIndicator.setStatus("FrontTSetRightCmd", autoACStatus.targetTemperatureRight);

			//carIndicator.setStatus("targetTemperatureLeft", autoACStatus.targetTemperatureLeft);
			//carIndicator.setStatus("FrontTSetLeftCmd", autoACStatus.targetTemperatureRight);

			if (autoACStatus.maxDefrost) {
				$("#defrost_max_btn").addClass("on");
			}
		}
	});
	// AirRecirculation
	$("#fan_control_circ").bind('click', function () {
		//carIndicator.setStatus("airRecirculation", !carIndicator.status.airRecirculation);
		//carIndicator.setStatus("RecircReq", !carIndicator.status.airRecirculation ? 1 : 0);

	});
	// SeatHeater - front right
	$("#right_seat_btn").bind('click', function () {
		var status = hvacController.prototype.status.SeatHeaterRight;

		var newStatus = undefined;
		switch (status) {
			case 5:
				newStatus = 3;
				break;
			case 3:
				newStatus = 1;
				break;
			case 1:
				newStatus = 0;
				break;
			case 0:
				newStatus = 5;
				break;
		}
		;
		if (!newStatus) newStatus = 0;

		hvacController.prototype.onSeatHeaterRightChanged(newStatus);
		sendRVI("hvac/seat_heat_right",newStatus);
	});

	// SeatHeater - front left
	$("#left_seat_btn").bind('click', function () {
		var status = hvacController.prototype.status.SeatHeaterLeft;

		var newStatus = undefined;
		switch (status) {
			case 5:
				newStatus = 3;
				break;
			case 3:
				newStatus = 1;
				break;
			case 1:
				newStatus = 0;
				break;
			case 0:
				newStatus = 5;
				break;
		}
		;
		if (!newStatus) newStatus = 0;

		hvacController.prototype.onSeatHeaterLeftChanged(newStatus);
		sendRVI("hvac/seat_heat_left",newStatus);
	});
	// AirflowDirection - FloorDuct - 1 (FOOT)
	$("#fan_dir_down_btn").bind('click', function () {
		var currentStatus = hvacController.prototype.status.airflowDirection;
		if ((currentStatus >= 0) && (currentStatus <= 7) && (hvacController.prototype.status.fanSpeed !== 0)) {
			var newStatus = changeAirflowDirectionStatus("#fan_dir_down_btn", currentStatus, 1);
			setAirFlowDirectionStatus(newStatus);
			sendRVI("hvac/airflow_direction",newStatus);
		}
	});
	// AirflowDirection - Defroster - 4 (SCREEN)
	$("#fan_dir_up_btn").bind('click', function () {
		var currentStatus = hvacController.prototype.status.airflowDirection;
		if ((currentStatus >= 0) && (currentStatus <= 7) && (hvacController.prototype.status.fanSpeed !== 0)) {
			var newStatus = changeAirflowDirectionStatus("#fan_dir_up_btn", currentStatus, 4);
			setAirFlowDirectionStatus(newStatus);
			sendRVI("hvac/airflow_direction",newStatus);
		}
	});
	// AirflowDirection - Front - 2 (FACE)
	$("#fan_dir_right_btn").bind('click', function () {
		var currentStatus = hvacController.prototype.status.airflowDirection;
		if ((currentStatus >= 0) && (currentStatus <= 7) && (hvacController.prototype.status.fanSpeed !== 0)) {
			var newStatus = changeAirflowDirectionStatus("#fan_dir_right_btn", currentStatus, 2);
			setAirFlowDirectionStatus(newStatus);
			sendRVI("hvac/airflow_direction",newStatus);
		}
	});
	// Max Defrost
	$("#defrost_max_btn").bind('click', function () {
		if ($("#defrost_max_btn").hasClass("on")) {
			$("#defrost_max_btn").removeClass("on");
		} else {
			$("#defrost_max_btn").addClass("on");

			/*
			if (carIndicator.status.targetTemperatureLeft < 16) {
				carIndicator.setStatus("targetTemperatureLeft", 16);
				carIndicator.setStatus("FrontTSetLeftCmd", 16);
			}
			if (carIndicator.status.targetTemperatureLeft > 28) {
				carIndicator.setStatus("targetTemperatureLeft", 28);
				carIndicator.setStatus("FrontTSetLeftCmd", 28);
			}

			carIndicator.setStatus("fanSpeed", 8);
			carIndicator.setStatus("FrontBlwrSpeedCmd", 15);
			*/
			setAirFlowDirectionStatus(7);

			switchAutoACOff();
		}

		sendRVI("hvac/defrost_max", !!($("#defrost_max_btn").hasClass("on")));
	});
	// Defrost - Rear
	$("#defrost_rear_btn").bind('click', function () {
		hvacController.prototype.status.rearDefrost = !hvacController.prototype.status.rearDefrost
		hvacController.prototype.onRearDefrostChanged(hvacController.prototype.status.rearDefrost);
		sendRVI("hvac/defrost_rear",hvacController.prototype.status.rearDefrost);
	});
	// Defrost - Front
	$("#defrost_front_btn").bind('click', function () {
		//Invert value
		hvacController.prototype.status.frontDefrost = !hvacController.prototype.status.frontDefrost
		hvacController.prototype.onFrontDefrostChanged(hvacController.prototype.status.frontDefrost);
		sendRVI("hvac/defrost_front",hvacController.prototype.status.frontDefrost);
	});
};

hvacController.prototype.initValues = function (){
}
