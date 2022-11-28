IMAGE_NAME=wkronmiller/artemis-oem
docker rm -f artemis || echo "No existing container"
docker build -t $IMAGE_NAME .
docker run -p5000:5000 --name artemis -v`pwd`/src:/usr/src/app/src --rm -it $IMAGE_NAME bash
#docker run -p5000:5000 --name artemis -v`pwd`/src:/usr/src/app/src --rm -d $IMAGE_NAME
#docker logs -f artemis
