#!/usr/bin/env python3
"""
Attempt to load/interact with Orion (EM1) Ephemeris data.

see: https://spiceypy.readthedocs.io/_/downloads/en/main/pdf/
see: https://towardsdatascience.com/space-science-with-python-setup-and-first-steps-1-8551334118f6
"""
import time
import math
import logging
import datetime
import spiceypy as spice

logging.basicConfig(level=logging.DEBUG)

logging.debug('cSpice version %s', spice.tkvrsn('TOOLKIT'))

logging.info('Loading data')
spice.furnsh('./data/naif0012.tls')
spice.furnsh('./data/orion.spk')
spice.furnsh('./data/earth_assoc_itrf93.tf')
logging.info('Loaded data')

utcnow = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S')
logging.debug('Current UTC time %s', utcnow)

# https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/cspice/spkgeo_c.html
([x,y, z, vx, vy, vz], light_time) = spice.spkgeo(
        targ=23, 
        et=spice.utc2et(utcnow), 
        ref='J2000', 
        obs=399
)

logging.debug("Position (km): (%17.5f, %17.5f, %17.5f)", x, y, z)
logging.debug("Vector (km/s): (%17.5f, %17.5f, %17.5f)", vx, vy, vz)
logging.debug("Light time (s): %18.13f", light_time)

distance_mi = math.sqrt(math.pow(x, 2) + math.pow(y, 2) + math.pow(z, 2)) * 0.621371
print('Distance (miles)', distance_mi)
