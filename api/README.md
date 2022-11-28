# About

Some scripts to track the current location of Artemis I's Orion spacecraft, using NASA OEM data.

Derived from [this](https://towardsdatascience.com/space-science-with-python-setup-and-first-steps-1-8551334118f6) tutorial on NASA SPICE and SpiceyPy.

## Local Setup (Not Recommended)

1. Install a python virtual environment: `python3 -m virtualenv venv && source venv/bin/activate`
2. Install requirements: `pip install -r requirements.txt`
3. Get Artemis ephemeris data, and SPICE kernel data: `./get-data.sh`
4. Install the OEM2SPK converter tool: `./get-tools.sh`
5. Convert from OEM to SPICE format: `./prepare-spk.sh`
6. Run the program: `python3 ./main.py`
