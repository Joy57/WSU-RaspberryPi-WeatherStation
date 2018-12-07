#Ubuntu xenial as a parent image
FROM ubuntu:16.04

# Install latest Node
RUN apt-get update
RUN apt-get -qq update
RUN apt-get install -y build-essential
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash
RUN apt-get install -y nodejs

# install service manager
RUN npm install -g pm2

# Set the directory
WORKDIR /usr/src/app

# Include the current directory contents into the container
# this will be changed to git repo later
ADD . /usr/src/app

# RUN app 
RUN npm i nodemon -g
RUN npm install

WORKDIR /usr/src/app/website

RUN npm install

WORKDIR /usr/src/app

RUN npm run migrate

EXPOSE 8000

WORKDIR /usr/src/app
# CMD npm run dev 
CMD pm2 start --no-daemon start.sh