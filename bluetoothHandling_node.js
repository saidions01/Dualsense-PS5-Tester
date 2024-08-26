const bluetooth = require('node-bluetooth');

// Create a bluetooth device instance
const device = new bluetooth.DeviceINQ();

// Function to scan for a specific MAC address
const scanForDevice = (macAddress, timeout = 60000) => {
  return new Promise((resolve, reject) => {
    let deviceFound = false;
    const timeoutId = setTimeout(() => {
      if (!deviceFound) {
        console.log('Scan timed out.');
        resolve(false);
      }
    }, timeout);

    device.on('found', (address, name) => {
      console.log(`Found: ${address} with name ${name}`);
      if (address.toLowerCase() === macAddress.toLowerCase()) {
        console.log(`Device ${macAddress} found!`);
        deviceFound = true;
        clearTimeout(timeoutId);
        resolve(true);
      }
    });

    console.log('Starting scan for devices...');
    device.scan();
  });
};

// Function to setup and connect the DualSense controller
const connectBluetoothDevice = (macAddress) => {
  return new Promise((resolve, reject) => {
    scanForDevice(macAddress).then(deviceFound => {
      if (deviceFound) {
        device.findSerialPortChannel(macAddress, (channel) => {
          if (!channel) {
            reject(new Error('Could not find serial port channel'));
            return;
          }
          console.log(`Found RFCOMM channel for serial port on ${macAddress}: ${channel}`);

          // Make Bluetooth connection to the remote device
          bluetooth.connect(macAddress, channel, (err, connection) => {
            if (err) {
              console.error('Failed to connect to the device:', err);
              reject(err);
              return;
            }
            console.log('Device paired, trusted, and connected successfully!');
            resolve(connection);
          });
        });
      } else {
        console.log('Device not found during scan.');
        resolve(null);
      }
    }).catch(err => {
      console.error('Failed to setup Bluetooth connection:', err);
      reject(err);
    });
  });
};

// Function to disconnect and remove the DualSense controller
const disconnectBluetoothDevice = async (macAddress) => {
  // Disconnect and remove functionality is not directly provided by node-bluetooth.
  // You would typically handle this at the application level by closing the connection,
  // and potentially using other system-level commands or APIs to remove paired devices.
  console.log('Disconnecting the DualSense controller is handled by closing the connection at application level.');
};

// Export the functions
module.exports = {
  connectBluetoothDevice,
  disconnectBluetoothDevice
};
