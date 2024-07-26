# ------steps------ #
Node.js Version 18 Required
# Update Package List #
sudo apt-get update

# Install Essential Build Tools #
sudo apt-get install build-essential

# Install libusb Development Library #
sudo apt-get install libusb-1.0-0-dev

# install libudev-dev #
sudo apt-get install libudev-dev

# Install GTK+ and ATK Libraries (this is used for creating graphical user interfaces and accessibility support) #
sudo apt-get install libatk1.0-0 libatk1.0-dev libgdk-pixbuf2.0-0 libgdk-pixbuf2.0-dev libgtk-3-0 libgtk-3-dev

# Install Project Dependencies #
npm install

# Build the Project Library #
npm run build:lib

# run the project #
npm run electron:start

# ---- to run this project on raspberry pi---- #

# build and package the project , generate .deb file #
npm run electron:make

# transfer the file to raspberry #
scp -r out/make/deb/arm64/dualsense-tester-nodejs_0.0.1_arm64.deb  pi@ip_adr:/home/pi/

nodejs version 18 required on raspberry

# on raspberry , update package  list #
sudo apt update

# Install essential build tools and dependencies #
sudo apt install build-essential libudev-dev

# Install libusb development files #
sudo apt install build-essential libudev-dev libusb-dev

# Install node-hid package #
npm install node-hid

# Install node-gyp (used for compiling native add-ons for Node.js) #
sudo npm install -g node-gyp

cd node_modules/node-hid

# Build the native module #
npm run build

# Copy the built module to the projects resources #
sudo cp node-modules/node-hid/build/Release/HID_hidraw.node /usr/lib/dualsense-tester-nodejs/resources/app/node-modules/node-hid/build/Release

