# rvi_hvac_mobile
RVI - HVAC integration

This application provides a remote interface for the Tizen IVI RVI HVAC app.

Use
===
To use this app, you can run it from a web server, or potentially package it in a Cordova application

Upon opening, tap on the gear icon to bring up the dialog for choosing a VIN to talk to. 
Type in your desired VIN, and press the *submit* button. The dialog will close and the instance will be
attempt to subscribe to the desired IVI.

ToDo
====
* There is currently no way to unsubscribe from an IVI
* Fan Direction, AC, Auto, and Air Circulation buttons do not currently function.

