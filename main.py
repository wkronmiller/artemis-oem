"""
Attempt to load/interact with Orion (EM1) Ephemeris data.

see: https://spiceypy.readthedocs.io/_/downloads/en/main/pdf/
see: https://towardsdatascience.com/space-science-with-python-setup-and-first-steps-1-8551334118f6
"""
import logging
import datetime
import spiceypy as spice

logging.basicConfig(level=logging.DEBUG)

logging.debug('cSpice version %s', spice.tkvrsn('TOOLKIT'))

logging.info('Loading data')
spice.furnsh('./data/naif0012.tls')
spice.furnsh('./data/orion.spk')
logging.info('Loaded data')

utcnow = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S')
logging.debug('Current UTC time %s', utcnow)

#help( spice.spkpos )
print(spice.spkgeo(targ=23, et=spice.utc2et(utcnow), ref='ECLIPJ2000', obs=399))
