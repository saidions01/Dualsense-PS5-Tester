const HID = require('node-hid');

function detectDualSense(callback) {
  const devices = HID.devices()
  // For test purposes, you can use the hardcoded devices array
  // const devices = [
  //   {
  //     vendorId: 1356,
  //     productId: 3302,
  //     path: '/dev/hidraw0',
  //     serialNumber: 'e1:55:47:ee:11:47',
  //     manufacturer: 'Sony Interactive Entertainment',
  //     product: 'DualSense Wireless Controller',
  //     release: 256,
  //     interface: 3, => USB
  //     usagePage: 1,
  //     usage: 5
  //   }
  // ]

  const dualsense = devices.find(device => device.vendorId === 1356 && device.productId === 3302)

  if (dualsense) {
    callback(true, dualsense)
  } else {
    callback(false)
  }
}

function startDetection(interval, callback) {
  setInterval(() => {
    detectDualSense(callback)
  }, interval)
}

module.exports = {
  startDetection
};
