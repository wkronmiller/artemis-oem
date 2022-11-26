FROM python:3

WORKDIR /usr/src/app

COPY ./get-data.sh .
RUN ./get-data.sh

COPY ./get-tools.sh .
RUN ./get-tools.sh .

COPY setup.oem2spk .
COPY ./prepare-spk.sh .
RUN ./prepare-spk.sh .

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src src

CMD [ "python", "./src/main.py" ]
