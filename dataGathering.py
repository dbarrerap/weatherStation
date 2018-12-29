#!/usr/bin/python

import Adafruit_BMP.BMP085 as BMP085
import Adafruit_DHT as DHT
import Adafruit_SSD1306
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont
import json
import sqlite3
from sqlite3 import Error
import time
import sys


# Initialize BMP180
sensor = BMP085.BMP085(mode=BMP085.BMP085_HIGHRES)
# Initialize OLED display
RST = None
disp = Adafruit_SSD1306.SSD1306_128_64(rst=RST)
disp.begin()
disp.clear()
disp.display()
width = disp.width
height = disp.height
image = Image.new('1', (width, height))
draw = ImageDraw.Draw(image)
draw.rectangle((0,0,width,height), outline=0, fill=0)
top = 0
x = 0
font = ImageFont.load_default()
draw.text((x, top), "Done setup!", font=font, fill=255)
disp.image(image)
disp.display()
time.sleep(.5)


def create_connection(db_file):
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)
    return None


def insert_data(conn, data):
    sql = ''' INSERT INTO climate(humidity, temperature, pressure, timestamp)
              VALUES (?, ?, ?, ?) '''
    cur = conn.cursor()
    cur.execute(sql, data)
    return cur.lastrowid


def open_file(file):
    with open(file) as json_file:
        data = json.load(json_file)
        return data


def get_reading():
    humidity, temperature = DHT.read_retry(11, 4)
    temperature = sensor.read_temperature()
    pressure = sensor.read_pressure()
    timestamp = time.strftime('%H:%M:%S')
    return {'humidity': humidity, 'temperature': temperature, 'pressure': pressure, 'timestamp': timestamp}
    # return {'humidity': 78.0, 'temperature': 28.0, 'pressure': 101012, 'timestamp': timestamp}  # mock data


def save_new_reading(file):
    readings = []
    try:
        readings = open_file(file)['readings']
    except Exception:
        print('No previous data...')
    new_data = get_reading()
    readings.append(new_data)
    # Save to File
    with open(file, 'w+') as outfile:
        json.dump({"readings": readings}, outfile)
    # Save to database
    conn = create_connection('weather.db')
    data = tuple(new_data.values())
    insert_data(conn, data)
    conn.commit()
    conn.close()


def main():
    file = 'climate-' + time.strftime('%Y-%m-%d') + '.json'
    save_new_reading(file)


if __name__ == '__main__':
    main()