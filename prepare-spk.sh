#!/bin/bash

rm data/orion.spk || echo 'No original'

ls data/Orion_OEM_202211* | sort | xargs -L1 ./bin/oem2spk -setup setup.oem2spk -input
