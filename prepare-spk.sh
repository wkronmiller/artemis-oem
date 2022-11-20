#!/bin/bash

rm data/orion.spk || echo 'No original'

./bin/oem2spk -setup setup.oem2spk -input data/Orion_OEM_20221116_LP28_P000_Open.txt
