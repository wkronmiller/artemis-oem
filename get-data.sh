#!/bin/bash

mkdir -p data && \
  cd data && \
	wget https://www.nasa.gov/sites/default/files/atoms/files/orion_lp28_ephemeris.zip && \
	unzip *.zip && \
	wget https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/latest_leapseconds.tls && \
	wget https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/naif0011.tls && \
	wget https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/naif0012.tls && \
	wget https://naif.jpl.nasa.gov/pub/naif/generic_kernels/fk/planets/earth_assoc_itrf93.tf && \
	echo "Done"

