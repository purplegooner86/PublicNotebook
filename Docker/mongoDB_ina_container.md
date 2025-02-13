# How to run a MongoDB server in a Docker container  

```sh
# Install the client:
wget -qO- https://www.mongodb.org/static/pgp/server-7.0.asc | sudo tee /etc/apt/trusted.gpg.d/server-7.0.asc
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update

sudo apt-get install mongodb-mongosh

# Setup the container:
docker pull mongo:latest
docker run -d -p 27017:27017 --name=mongo-db mongo:latest
docker exec -it mongo-db mongosh
```
