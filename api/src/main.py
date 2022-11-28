#!/usr/bin/env python3
import time
import logging
import datetime
import json

from flask import Flask, request
from flask_cors import CORS
from position import get_geo, get_time_range
from object_ids import *

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.DEBUG)

def get_time_intervals():
    time_range = get_time_range()
    times = []
    # TODO: deal with the annoying start/stop time artifact
    time = time_range.start + datetime.timedelta(seconds=1)
    while time < time_range.end:
        times.append(time)
        time = time + datetime.timedelta(hours=1)
    return times

orbital_times = get_time_intervals()
artemis_positions = [get_geo(EARTH_MOON_BARYCENTER, ARTEMIS, time).point for time in orbital_times]
moon_positions = [get_geo(EARTH_MOON_BARYCENTER, MOON, time).point for time in orbital_times]

@app.route('/api/v1/orbits')
def get_orbits():
    return json.dumps({
        'artemis': artemis_positions,
        'moon': moon_positions,
    }, default=str)

@app.route('/api/v1/positions')
def get_current_positions():
    now = datetime.datetime.utcnow()
    artemis = list(get_geo(EARTH_MOON_BARYCENTER, ARTEMIS, now).point)
    moon = list(get_geo(EARTH_MOON_BARYCENTER, MOON, now).point)
    earth = list(get_geo(EARTH_MOON_BARYCENTER, EARTH, now).point)

    return json.dumps({
        'timestamp': now,
        'artemis': artemis,
        'moon': moon,
        'earth': earth,
    }, indent=4, sort_keys=True, default=str)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
