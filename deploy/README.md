# Weather Station
Raspberry Pi Weather Station with Node/React webserver to display data

## How to Start the Development Server
1. Navigate into the root of the project directory with your terminal and run:
```sh
npm run dev
```

## How to Start the Production Server
1. Generate a build of the React frontend
```sh
cd website/
npm run build
cd ../
```
2. Run the production server
```sh
npm run prod
```

## File Structure
1. server
  * controllers/: Contains all routes for each controller type.
  * models/: Contains all bookshelf (our ORM) models for the database. Import these when accessing data.
  * migrations/: Contains all knex database migrations as well as our initial db setup file.
  * bookshelf.js & knex.js: Database configuration files
  * server.js: Starts the express server.
  * app.js: Maps controllers to urls on the server.
2. client/
  * client.py: Runs the client code meant to go on the Raspberry Pi
3. website/
  * components/: Component classes which will be individually styled and placed into containers
  * containers/: Full page container (such as the "Connected Stations" page) which combines our components
  * styles/: All of our .css files are placed here
  * images/: All of our images are placed here
  * test/: React test files are placed here  

## Installing New Dependencies
1. If you want to install a new dependency to be used both in development and in production:
```sh
npm install packagename --save
```
2. If you want to install a new dependency only in development for testing purposes:
```sh
npm install packagename --save-dev
```

## Migrating Databases
1. Install knex, our query builder globally
```sh
npm install knex -g
```
2. Run latest migrations
```sh
npm run migrate
```
3. If you have any issues, rollback the database to the beginning
```sh
npm run rollback
```
4. Review the knex documentation for more information [here](http://knexjs.org/#Migrations)

## Install Node Server + Website
This project requires the following dependencies before continuing the install:
1. Node v9.5.0 - Install [here](https://nodejs.org/en/)
2. Yarn v1.3.2 - Install [here](https://yarnpkg.com/en/docs/install)
3. MySQL (On Mac OS, install via [homebrew](https://brew.sh). For Windows, go [here](https://dev.mysql.com/downloads/mysql/))
```sh
# Mac OS X only
brew install mysql
brew services start mysql
```

Database Setup:
1. Create a MySQL user with the name "weatherstation" and password "ws1234".
```sh
# Log into your MySQL shell. If you have a password on your root account 
# also add -p onto the end of the following command. 
mysql -u root
# Once logged in, create the user
mysql > CREATE USER 'weatherstation'@'localhost' IDENTIFIED BY 'ws1234';
# Grant all privileges to the new user you have created
mysql > GRANT ALL PRIVILEGES ON * . * TO 'weatherstation'@'localhost';
mysql > FLUSH PRIVILEGES;
```
2. Create a database with the name weatherstation while logged into your MySQL shell.
```sh
mysql > CREATE DATABASE weatherstation;
```

After you have installed the above dependencies:
1. Using your terminal, cd into where you want to store your project directory.
2. Install nodemon globally and the server dependencies:
```sh
npm i nodemon -g
```
3. Clone the git repository 
```sh
git clone https://github.com/batiyeh/weather-station-site
```
4. Navigate inside the weather-station directory:
```sh
cd weather-station-site
```
5. Install all required dependencies for both the server and the website
```sh
npm install; cd website; npm install; cd ../
```
6. Create all necessary database tables
```sh
npm run migrate
```
7. Run the development server
```sh
npm run dev
```


## Install Client Code on Raspberry Pi
This is meant to be used on a Raspberry Pi running Raspbian OS but can be installed for testing on Mac OS or Windows. We are officially supporting only Raspbian OS for now.

### Raspberry Pi
This project requires the following dependencies before continuing the install:
1. Python 3.5+ (included on Raspberry Pi 3 Model B)

After you have installed the above dependencies:
1. Open up terminal and navigate to where you want to store this project
2. Clone the repository and navigate inside it.
```sh
git clone https://github.com/batiyeh/weather-station-site
cd weather-station/client
```
3. Install the requirements that come with the project:
```sh
sudo pip3 install -r pi-requirements.txt
```
3. Go to the weather station website and obtain an API Key from the admin page
4. Go back to your Raspberry Pi, run the program with sudo, and enter in your API Key when prompted
```sh
sudo python3 client.py
```

#### Build Client Binary 
1. Open up terminal and navigate to where you have stored this project
2. Navigate into the client folder
```sh
cd client/
```
3. Run Pyinstaller to generate a binary build from our config file
```sh
pyinstaller weatherstation.spec -F
```
4. The new client build should be in the dist/ directory in the client folder.

#### Set Binary to Start on Reboot
1. Add the following line to the bottom of your .bashrc file in your home directory on the Raspberry Pi
```sh
cd path/to/weatherstation/binary; ./weatherstation > /dev/null 2> /dev/null &
```
2. Same thing with just the code itself (optional for test purposes)
```sh
/usr/bin/python /home/pi/dev/weather-station-site/client/weatherstation.py > /dev/null 2> /dev/null &
```


### Sensors
#### GPS
1. Ensure the GPS sensor and RPI is near a window or outside.

2. Install the necessary GPS libraries for data retrieval
```sh
sudo apt-get install gpsd gpsd-clients python-gps
```

3. Connect our device to the gpsd library socket
```sh
sudo gpsd /dev/ttyACM0 -F /var/run/gpsd.sock
```

4. Open the gpsd.sock file
```sh
sudo nano /etc/default/gpsd
```

5. Add the following lines to the bottom of the gpsd.sock file
```sh
# Other options you want to pass to gpsd
START_DAEMON="true"
GPSD_OPTIONS="/dev/ttyACM0"
DEVICE=""
USBAUTO="true"
GPSD_SOCKET="/var/run/gpsd.sock"
```

6. Reboot the Raspberry Pi.
```sh
sudo reboot
```

7. Test that it is working
```sh
cpgs -s
# Wait a minute or two for it to find a satellite
# If it is not working, try running step #2 again
```
#### Humidity and Temperature
1. Make sure that the sensor is open and not being covered by anything.

2. Connect the + wire to the 2 pin on the Pi which is for 5V of power.

3. Connect the - wire to the 6 pin on the Pi which is for Ground.

4. Connect the data wire to the 8 pin on the Pi which is for the GPIO 14.

For pin numbering check this website with the GPIO Pinout Diagram
https://www.jameco.com/Jameco/workshop/circuitnotes/raspberry-pi-circuit-note.html

5. Follow [this](https://www.modmypi.com/blog/am2302-temphumidity-sensor) tutorial for installing the proper software

#### Pressure
1. Make sure that the sensor is open and not being covered by anything.

2. Connect the female to female wires to the Vin, Gnd, Sck, and Sdi pins on the pressure sensor.

3. Connect the Vin wire to the 1 pin on the Pi which is for 3V of power.

4. Connect the Gnd wire to the 9 pin on the Pi which is for Ground.

5. Connect the Sck wire to the 5 pin on the Pi which is for the I2C clock.

6. Connect the Sdi wire to the 3 pin on the Pi which is for the I2c data.

7. Once all wires have been connected go to the Raspberry Pi configuration and enable I2c.

8. To make sure that the sensor has properly been connected you can run the command sudo i2cdetect -y 1

For more information about the sensor check this website
https://learn.adafruit.com/adafruit-bmp280-barometric-pressure-plus-temperature-sensor-breakout?view=all

#### Sense Hat
1. Install the sense hat library
```sh
sudo apt-get update
sudo apt-get install sense-hat
```
2. Reboot Raspberry Pi
```sh
sudo reboot
```
