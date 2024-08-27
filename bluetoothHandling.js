const { spawn } = require('child_process');

// Function to run bluetoothctl commands in sequence with delays
const runBluetoothctlCommand = (commands) => {
  return new Promise((resolve, reject) => {
    const bluetoothctl = spawn('bluetoothctl');

    bluetoothctl.stdout.on('data', (data) => {
      console.log(`bluetoothctl: ${data}`);
    });

    bluetoothctl.stderr.on('data', (data) => {
      console.error(`bluetoothctl error: ${data}`);
    });

    bluetoothctl.on('close', (code) => {
      console.log(`bluetoothctl process exited with code ${code}`);
      resolve();
    });

    bluetoothctl.on('error', (err) => {
      reject(err);
    });

    const executeCommandsSequentially = async () => {
      for (const command of commands) {
        console.log(`Running command: ${command}`);
        bluetoothctl.stdin.write(command + '\n');
        await new Promise(resolve => setTimeout(resolve, 1000));  // Short delay for other commands
      }
      bluetoothctl.stdin.end();  // Closes the input stream to signal end of commands
    };

    executeCommandsSequentially();
  });
};

// Function to reset the Bluetooth adapter
const resetBluetoothAdapter = async () => {
  await runBluetoothctlCommand(['power off']);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
  await runBluetoothctlCommand(['power on']);
};

// Function to scan for a specific MAC address
const scanForDevice = (macAddress, timeout = 60000) => {
  return new Promise((resolve, reject) => {
    const bluetoothctl = spawn('bluetoothctl');
    let deviceFound = false;

    bluetoothctl.stdout.on('data', (data) => {
      const output = data.toString().toLowerCase();
      console.log(`bluetoothctl: ${output}`);

      if (output.includes(macAddress.toLowerCase())) {
        console.log(`Device ${macAddress} found!`);
        deviceFound = true;
        bluetoothctl.stdin.write('scan off\n');
        resolve(true);
      }
    });

    bluetoothctl.stderr.on('data', (data) => {
      console.error(`bluetoothctl error: ${data}`);
    });

    bluetoothctl.on('close', (code) => {
      if (!deviceFound) {
        console.log(`bluetoothctl process exited with code ${code}`);
        resolve(false);
      }
    });

    bluetoothctl.on('error', (err) => {
      reject(err);
    });

    console.log('Starting scan for devices...');
    bluetoothctl.stdin.write('scan on\n');

    // Stop scanning after the timeout if the device isn't found
    setTimeout(() => {
      if (!deviceFound) {
        console.log('Scan timed out, stopping scan.');
        bluetoothctl.stdin.write('scan off\n');
        resolve(false);
      }
    }, timeout);
  });
};

// Function to setup and connect the DualSense controller
const connectBluetoothDevice = async (macAddress) => {
  try {
    console.log('Starting Bluetooth setup...');

    // Reset Bluetooth adapter before attempting to connect
    await resetBluetoothAdapter();

    const deviceFound = await scanForDevice(macAddress);

    if (deviceFound) {
      console.log('Device found, proceeding with pairing and connecting...');
      const commands = [
        `pair ${macAddress}`,
        `trust ${macAddress}`,
        `connect ${macAddress}`
      ];
      await runBluetoothctlCommand(commands);
      console.log('Device paired, trusted, and connected successfully!');
    } else {
      console.log('Device not found during scan.');
    }

  } catch (error) {
    console.error('Failed to setup Bluetooth connection:', error);
  }
};

// Function to disconnect and remove the DualSense controller
const disconnectBluetoothDevice = async (macAddress) => {
  try {
    console.log('Disconnecting the DualSense controller...');
    await runBluetoothctlCommand([`disconnect ${macAddress}`]);

    console.log('Removing the DualSense controller from known devices...');
    await runBluetoothctlCommand([`remove ${macAddress}`]);

    console.log('DualSense controller disconnected and removed successfully!');

    // Optionally reset Bluetooth adapter after removal
    await resetBluetoothAdapter();

  } catch (error) {
    console.error('Failed to disconnect and remove DualSense controller:', error);
  }
};

// Export the functions
module.exports = {
  connectBluetoothDevice,
  disconnectBluetoothDevice
};