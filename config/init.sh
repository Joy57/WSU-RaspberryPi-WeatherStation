#!/bin/bash
sudo apt-get update -y
sudo apt-get install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add - 
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update -y
sudo apt-get install docker-ce -y
echo "Verifying docker installation..."
sudo docker run hello-world 

echo "Pulling the weather image and running it"
sudo docker run -p 8000:8000 --restart unless-stopped joyabe18/final:latest

