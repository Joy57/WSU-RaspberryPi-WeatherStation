#!/bin/bash
sudo apt-get update -y
sudo apt-get install nginx -y
sudo rm /etc/nginx/nginx.conf
sudo rm /etc/nginx/sites-enabled/default
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo cp default /etc/nginx/sites-enabled/default
sudo service nginx restart
chmod u+x init.sh
echo "#####Completed all steps...#####"
echo "Now, you can run ./init.sh"