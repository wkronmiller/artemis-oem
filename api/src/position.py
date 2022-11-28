#!/usr/bin/env python3
"""
Attempt to load/interact with Orion (EM1) Ephemeris data.

see: https://spiceypy.readthedocs.io/_/downloads/en/main/pdf/
see: https://towardsdatascience.com/space-science-with-python-setup-and-first-steps-1-8551334118f6
"""
import time
import math
import logging
from dateutil import parser
from datetime import datetime, timezone
from typing import NamedTuple
from collections import namedtuple
import spiceypy as spice
from object_ids import *

logging.basicConfig(level=logging.DEBUG)

logging.debug('cSpice version %s', spice.tkvrsn('TOOLKIT'))

logging.info('Loading data')

ORION_DATA_PATH = './data/orion.spk'

#spice.furnsh('./data/naif0011.tls')
spice.furnsh('./data/naif0012.tls')
spice.furnsh(ORION_DATA_PATH)
spice.furnsh('./data/earth_assoc_itrf93.tf')
spice.furnsh('./data/de430.bsp')
spice.furnsh('./data/latest_leapseconds.tls')
logging.info('Loaded data')

utcnow = datetime.now(timezone.utc)
logging.debug('Current UTC time %s', utcnow)

class Point(NamedTuple):
    x: float
    y: float
    z: float

    @property
    def distance_km(self) -> float:
        return math.sqrt(math.pow(self.x, 2) + math.pow(self.y, 2) + math.pow(self.z, 2))

    @property
    def distance_mi(self) -> float:
        return self.distance_km * 0.621371

    def __str__(self) -> str:
        return 'Position (km): (%17.5f, %17.5f, %17.5f)' % (self.x, self.y, self.z)

Vector = namedtuple('Vector', ['vx', 'vy', 'vz'])
GeoState = namedtuple('GeoState', ['point', 'vector', 'light_time'])

TimeRange = namedtuple('TimeRange', ['start', 'end'])

def get_time_range() -> TimeRange:
    """
    Get the Orion spacecraft ephemeris usable time range
    """
    [start, end] = [
        parser.parse(spice.et2utc(x, 'ISOC', 1))
        for x in spice.spkcov(ORION_DATA_PATH, ARTEMIS)]
    return TimeRange(start, end)

def get_geo(observer: int, target: int, at_time: datetime = utcnow) -> GeoState:
    """
    Get the Geometric state of the specified target, from the specified observer
    """
    logging.debug("Computing geometry from %d to %d at time %s", observer, target, at_time)
    # https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/cspice/spkgeo_c.html
    ([x, y, z, vx, vy, vz], light_time) = spice.spkgeo(
            targ=target,
            et=spice.utc2et(at_time.strftime('%Y-%m-%dT%H:%M:%S')),
            ref='J2000',
            obs=observer
    )

    point = Point(x, y, z)
    logging.debug("%s", point)
    logging.debug("Vector (km/s): (%17.5f, %17.5f, %17.5f)", vx, vy, vz)
    logging.debug("Light time (s): %18.13f", light_time)

    vector = Vector(vz, vy, vz)
    return GeoState(point, vector, light_time)

