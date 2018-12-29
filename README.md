# weatherStation

## Components

* DHT11 (can be used any DHT module, adjust code accordingly)
* BMP180
* OLED display

## Functionality

### dataGathering.py

This Python script gathers climate data every minute from sensors and 
does the following:

* Show data on the display
* Save data to a sqlite database
* Save data to a JSON file

### index.html

HTML placeholder to display data on a web server. Uses 
[chartjs](http://chartjs.org) and [Bootstrap](http://getbootstrap.com).

### script.js

Loads the JSON file according to its date (selected on the HTML) and 
loads it into the chart and table.

If you want to test it, I included a JSON file from December 20, 2018 
indoor climate readings.
