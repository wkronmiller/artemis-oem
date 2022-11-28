#!/bin/bash

mkdir -p bin && \
  cd bin && \
	wget https://naif.jpl.nasa.gov/pub/naif/utilities/PC_Linux_64bit/oem2spk && \
	chmod +x ./oem2spk
