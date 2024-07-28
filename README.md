# Project Setup and Installation Guide

## Prerequisites

- **Node.js Version 18** is required.

## Setup Instructions

### On Your Development Environment

1. **Update Package List**
    ```bash
    sudo apt-get update
    ```

2. **Install Essential Build Tools**
    ```bash
    sudo apt-get install build-essential
    ```

3. **Install libusb Development Library**
    ```bash
    sudo apt-get install libusb-1.0-0-dev
    ```

4. **Install libudev Development Library**
    ```bash
    sudo apt-get install libudev-dev
    ```

5. **Install GTK+ and ATK Libraries**  
   *(For creating graphical user interfaces and accessibility support)*
    ```bash
    sudo apt-get install libatk1.0-0 libatk1.0-dev libgdk-pixbuf2.0-0 libgdk-pixbuf2.0-dev libgtk-3-0 libgtk-3-dev
    ```

6. **Install Project Dependencies**
    ```bash
    npm install
    ```

7. **Build the Project Library**
    ```bash
    npm run build:lib
    ```

8. **Run the Project**
    ```bash
    npm run electron:start
    ```

9. **Build and Package the Project**  
   *(Generates a .deb file)*
    ```bash
    npm run electron:make
    ```

10. **Transfer the File to Raspberry Pi**
    ```bash
    scp -r out/make/deb/arm64/dualsense-tester-nodejs_0.0.1_arm64.deb pi@ip_adr:/home/pi/
    ```

### On Raspberry Pi

1. **Update Package List**
    ```bash
    sudo apt update
    ```

2. **Install Essential Build Tools and Dependencies**
    ```bash
    sudo apt install build-essential libudev-dev
    ```

3. **Install libusb Development Files**
    ```bash
    sudo apt install libusb-dev
    ```

4. **Install `node-hid` Package**
    ```bash
    npm install node-hid
    ```

5. **Install `node-gyp`**  
   *(For compiling native add-ons for Node.js)*
    ```bash
    sudo npm install -g node-gyp
    ```

6. **Build the Native Module**
    ```bash
    cd node_modules/node-hid
    npm run build
    ```

7. **Copy the Built Module to the Project's Resources**
    ```bash
    sudo cp node_modules/node-hid/build/Release/HID_hidraw.node /usr/lib/dualsense-tester-nodejs/resources/app/node_modules/node-hid/build/Release
    ```

---