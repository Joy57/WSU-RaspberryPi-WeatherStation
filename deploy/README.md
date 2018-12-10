# Quick Start Guide

Install Docker from  https://docs.docker.com/install/

##### Clone this Repository
```
git clone https://github.com/Joy57/WSU-RaspberryPi-WeatherStation-Final.git
```

From the “WSU-RaspberryPi-WeatherStation-Final” folder. 
```
$ cd deploy
```


##### Modifying DB endpoint
Open the knexfile.js and modify the endpoint to your local/remote db endpoint. Also, make sure to change the user name and password parameters. 
```
# use nano or vim or vscode or whatever text editor you have in your computer. I used vim in the below step.
$ vim knexfile.js
```
Below are the parameters:
```
    host : 'your_db_endpoint',
    port:'3306',
    user : 'your_db_user_name',
    password : 'your_db_password',
    database : 'weatherstation',
```
Make sure to create a database named `weatherstation` in your local/remote database.

### Build
From the directory “deploy” execute the following line. When it completes building it. Run the same line again. 
```$ docker build -t final .```

```$ docker images```

Find the image name that says “final” and copy the IMAGE ID of it. Assign it to the IMAGEID.


```$ docker run -p 8000:8000 final```

Open localhost:8000 on your browser. 


#### AWS Deployment

To deploy in AWS refer to the AWS Version documentation in the below directory:

```WSU-RaspberryPi-WeatherStation-Final/Documentations/```