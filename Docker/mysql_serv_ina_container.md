# How to run a mysql server in a Docker container  

Clone a mysql docker image:  
`sudo docker pull mysql/mysql-server:latest`  

Run it:
`docker run -d <image id>`  

`docker ps` to make sure it is running  

find the root password that was generated:  
`docker logs <container name> | grep PASSWORD`  

Get a shell on the container:  
`docker exec -it <container name> /bin/sh`  

On the container, connect to mysql:  
`mysql -u root -p`  
Enter the root password  

Change the root password to `goober`:  

mysql\> `ALTER USER 'root'@'localhost' IDENTIFIED BY 'goober';`  

Allow connection from other ip addresses:  
mysql\> `CREATE USER 'root'@'%' IDENTIFIED BY 'goober';`  
mysql\> `GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;`  
mysql\> `FLUSH PRIVILEGES`  

Then you should be able to connect from a mysql client on your host to the mysql server on the docker container:  
- Find IP Address of the docker container:  
    - `docker container inspect <container name> | grep IPAddress`  
- `sudo apt-get install default-mysql-client`
- `mysql -h 172.17.0.2 -u root -p`  

