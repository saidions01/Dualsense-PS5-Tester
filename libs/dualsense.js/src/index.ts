import {
  VENDOR_ID_SONY,
  PRODUCT_ID_DUAL_SENSE,
  DUAL_SENSE_USB_INPUT_REPORT_0x01_SIZE,
  DUAL_SENSE_BT_INPUT_REPORT_0x01_SIZE,
  DUAL_SENSE_BT_INPUT_REPORT_0x31_SIZE,
  PROPERTY_DEVICE,
  PROPERTY_OPTIONS
} from './constants'

import { EventEmitter } from 'events';
import { DualSenseInterface, DualSenseState, defaultState } from './gadgets/state'
import { normalizeButton, normalizeThumbStickAxis, normalizeTriggerAxis } from './utils/controller'
import { DualSenseOutput, defaultOutput } from './gadgets/output'
import { fillDualSenseChecksum } from './utils/crc32'

export type { DualSenseState, DualSenseInterface, DualSenseOutput }

export interface DualSenseOptions { }

export class DualSense extends EventEmitter {
  /** Internal HID device */
  [PROPERTY_DEVICE]?: any;

  /** Internal Options */
  [PROPERTY_OPTIONS]: DualSenseOptions

  /** Internal Output Seq index */
  #outputSeq = 1

  /** Raw contents of the last HID Report sent by the controller. */
  lastReport?: ArrayBuffer
  /** Raw contents of the last HID Report sent to the controller. */
  lastSentReport?: ArrayBuffer

  /** Current controller state */
  state: DualSenseState = { ...defaultState }

  /** Current output report */
  output: DualSenseOutput = { ...defaultOutput }

  /** Reference to the HID library, passed in from the main process */
  HID: any

  isConnected = false

  serialNumber: String = ''

  constructor(options: DualSenseOptions, HID: any) {
    super()

    this[PROPERTY_OPTIONS] = options
    this.HID = HID

    this.#checkGrantedController()
  }

  #onConnectionError() {
    this.emit('disconnected')
    this.isConnected = false
    this[PROPERTY_DEVICE]?.close()
  }

  /**
   * Check for granted device
   */
  async #checkGrantedController() {
    if (this[PROPERTY_DEVICE] && !this[PROPERTY_DEVICE].opened) {
      this.emit('disconnected')
      this.isConnected = false
      this.#onConnectionError()
    }

    try {
      const devices = this.HID.devices();
      // Check if we already have permissions for a DualSense device.
      const deviceInfo = devices.find((device: any) => device.vendorId === VENDOR_ID_SONY && device.productId === PRODUCT_ID_DUAL_SENSE);
      if (deviceInfo && deviceInfo.path) {

        console.log("--------- checkGrantedController --------------")
        console.log(deviceInfo)
        console.log("-----------------------------------------------")

        const device = new this.HID.HID(deviceInfo.path);
        this[PROPERTY_DEVICE] = device
        this.serialNumber = deviceInfo.serialNumber

        console.log("--------- checkGrantedController --------------")
        console.log(this.serialNumber)
        console.log("-----------------------------------------------")
        this.#checkConnectInterface(deviceInfo)
        this[PROPERTY_DEVICE].on('data', this.#handleControllerReport.bind(this))
        this[PROPERTY_DEVICE].on('error', this.#onConnectionError.bind(this))
      } else {
        console.log('No suitable HID device found');
        this.emit('disconnected')
        this.isConnected = false
      }
    } catch (error) {
      console.error('Failed to open HID device:', error);
      this.emit('disconnected')
      this.isConnected = false
      this.serialNumber = ''
    }
  }

  /**
   * Check connect interface
   */
  #checkConnectInterface(deviceInfo: any) {
    if (deviceInfo.interface > 0)
      this.state.interface = DualSenseInterface.USB
    else
      this.state.interface = DualSenseInterface.Bluetooth
  }

  async requestDevice() {
    try {
      const deviceInfo = this.HID.devices().find((device: any) => device.vendorId === VENDOR_ID_SONY && device.productId === PRODUCT_ID_DUAL_SENSE);
      if (deviceInfo && deviceInfo.path) {

        console.log("--------- requestDevice --------------")
        console.log(deviceInfo)
        console.log("---------------------------------------")

        const device = new this.HID.HID(deviceInfo.path);
        this[PROPERTY_DEVICE] = device
        this.serialNumber = deviceInfo.serialNumber

        console.log("--------- requestDevice --------------")
        console.log(this.serialNumber)
        console.log("--------------------------------------")
        this.#checkConnectInterface(deviceInfo)
        this[PROPERTY_DEVICE].on('data', this.#handleControllerReport.bind(this))
        this[PROPERTY_DEVICE].on('error', this.#onConnectionError.bind(this))
        return true;
      } else {
        this.emit('disconnected')
        this.isConnected = false
        this.serialNumber = ''
        return false;
      }
    } catch (error) {
      console.error(error)
      this.emit('disconnected')
      this.isConnected = false
      return false
    }
  }

  /**
   * Parses a report sent from the controller and updates the state.
   *
   * This function is called internally by the library each time a report is received.
   *
   * @param data - HID Report sent by the controller.
   */
  #handleControllerReport(data: Buffer) {

    if (!this.isConnected) {
      this.emit('connected')
      this.isConnected = true
    }

    const reportId = data[0]
    const report = new DataView(data.buffer.slice(1)) // Skip reportId
    this.state.timestamp = Date.now()
    this.lastReport = report.buffer

    if (this.state.interface == DualSenseInterface.USB) {
      if (reportId == 0x01) this.#handleUsbInputReport01(report)
      else {
        return
      }
    } else if (this.state.interface == DualSenseInterface.Bluetooth) {
      if (reportId == 0x01) this.#handleBluetoothInputReport01(report)
      else if (reportId == 0x31) this.#handleBluetoothInputReport31(report)
      else {
        return
      }
    } else {
      return
    }
  }

  #handleUsbInputReport01(report: DataView) {
    if (report.byteLength != DUAL_SENSE_USB_INPUT_REPORT_0x01_SIZE) return

    const axes0 = report.getUint8(0)
    const axes1 = report.getUint8(1)
    const axes2 = report.getUint8(2)
    const axes3 = report.getUint8(3)
    const axes4 = report.getUint8(4)
    const axes5 = report.getUint8(5)
    const buttons0 = report.getUint8(7)
    const buttons1 = report.getUint8(8)
    const buttons2 = report.getUint8(9)
    const gyroX = report.getInt16(15, true)
    const gyroY = report.getInt16(17, true)
    const gyroZ = report.getInt16(19, true)

    const accelX = report.getInt16(21, true)
    const accelY = report.getInt16(23, true)
    const accelZ = report.getInt16(25, true)

    const touch00 = report.getUint8(32)
    const touch01 = report.getUint8(33)
    const touch02 = report.getUint8(34)
    const touch03 = report.getUint8(35)
    const touch10 = report.getUint8(36)
    const touch11 = report.getUint8(37)
    const touch12 = report.getUint8(38)
    const touch13 = report.getUint8(39)
    const battery0 = report.getUint8(52)
    const battery1 = report.getUint8(53)

    const lsx = normalizeThumbStickAxis(axes0)
    const lsy = normalizeThumbStickAxis(axes1)
    const rsx = normalizeThumbStickAxis(axes2)
    const rsy = normalizeThumbStickAxis(axes3)
    const l2axis = normalizeTriggerAxis(axes4)
    const r2axis = normalizeTriggerAxis(axes5)

    const dpad = buttons0 & 0x0f
    const up = normalizeButton(dpad == 0 || dpad == 1 || dpad == 7)
    const down = normalizeButton(dpad == 3 || dpad == 4 || dpad == 5)
    const left = normalizeButton(dpad == 5 || dpad == 6 || dpad == 7)
    const right = normalizeButton(dpad == 1 || dpad == 2 || dpad == 3)
    const square = normalizeButton(buttons0 & 0x10)
    const cross = normalizeButton(buttons0 & 0x20)
    const circle = normalizeButton(buttons0 & 0x40)
    const triangle = normalizeButton(buttons0 & 0x80)
    const l1 = normalizeButton(buttons1 & 0x01)
    const r1 = normalizeButton(buttons1 & 0x02)
    const l2 = normalizeButton(buttons1 & 0x04)
    const r2 = normalizeButton(buttons1 & 0x08)
    const create = normalizeButton(buttons1 & 0x10)
    const options = normalizeButton(buttons1 & 0x20)
    const l3 = normalizeButton(buttons1 & 0x40)
    const r3 = normalizeButton(buttons1 & 0x80)
    const ps = normalizeButton(buttons2 & 0x01)
    const touchpad = normalizeButton(buttons2 & 0x02)
    const mute = normalizeButton(buttons2 & 0x04)

    const touch0active = !(touch00 & 0x80)
    const touch0id = touch00 & 0x7f
    const touch0x = ((touch02 & 0x0f) << 8) | touch01
    const touch0y = (touch03 << 4) | ((touch02 & 0xf0) >> 4)
    const touch1active = !(touch10 & 0x80)
    const touch1id = touch10 & 0x7f
    const touch1x = ((touch12 & 0x0f) << 8) | touch11
    const touch1y = (touch13 << 4) | ((touch12 & 0xf0) >> 4)

    const batteryLevelPercent = Math.min((battery0 & 0x0f) * 10 + 5, 100)
    const batteryFull = !!(battery0 & 0x20)
    const batteryCharging = !!(battery1 & 0x08)
    const headphoneConnected = !!(battery1 & 0x01)

    this.state.buttons.cross = cross
    this.state.buttons.circle = circle
    this.state.buttons.square = square
    this.state.buttons.triangle = triangle

    this.state.buttons.l1 = l1
    this.state.buttons.r1 = r1
    this.state.buttons.l2 = l2
    this.state.buttons.r2 = r2

    this.state.axes.l2 = l2axis
    this.state.axes.r2 = r2axis

    this.state.buttons.create = create
    this.state.buttons.options = options
    this.state.buttons.l3 = l3
    this.state.buttons.r3 = r3

    this.state.buttons.dPadUp = up
    this.state.buttons.dPadDown = down
    this.state.buttons.dPadLeft = left
    this.state.buttons.dPadRight = right

    this.state.buttons.playStation = ps
    this.state.buttons.touchPadClick = touchpad
    this.state.buttons.mute = mute

    this.state.axes.leftStickX = lsx
    this.state.axes.leftStickY = lsy
    this.state.axes.rightStickX = rsx
    this.state.axes.rightStickY = rsy

    this.state.touchpad.touches = []
    if (touch0active) {
      this.state.touchpad.touches.push({
        touchId: touch0id,
        x: touch0x,
        y: touch0y
      })
    }
    if (touch1active) {
      this.state.touchpad.touches.push({
        touchId: touch1id,
        x: touch1x,
        y: touch1y
      })
    }

    this.state.axes.gyroX = gyroX
    this.state.axes.gyroY = gyroY
    this.state.axes.gyroZ = gyroZ
    this.state.axes.accelX = accelX
    this.state.axes.accelY = accelY
    this.state.axes.accelZ = accelZ

    this.state.battery.charging = batteryCharging
    this.state.battery.full = batteryFull
    this.state.battery.level = batteryLevelPercent
    this.state.headphoneConnected = headphoneConnected

    // Emit state change event
    this.emit('state-change', { detail: this.state })
  }

  #handleBluetoothInputReport01(report: DataView) {

    const axes0 = report.getUint8(0)
    const axes1 = report.getUint8(1)
    const axes2 = report.getUint8(2)
    const axes3 = report.getUint8(3)
    const buttons0 = report.getUint8(4)
    const buttons1 = report.getUint8(5)
    const buttons2 = report.getUint8(6)
    const axes4 = report.getUint8(7)
    const axes5 = report.getUint8(8)

    const lsx = normalizeThumbStickAxis(axes0)
    const lsy = normalizeThumbStickAxis(axes1)
    const rsx = normalizeThumbStickAxis(axes2)
    const rsy = normalizeThumbStickAxis(axes3)
    const l2axis = normalizeTriggerAxis(axes4)
    const r2axis = normalizeTriggerAxis(axes5)

    const dpad = buttons0 & 0x0f
    const up = normalizeButton(dpad == 0 || dpad == 1 || dpad == 7)
    const down = normalizeButton(dpad == 3 || dpad == 4 || dpad == 5)
    const left = normalizeButton(dpad == 5 || dpad == 6 || dpad == 7)
    const right = normalizeButton(dpad == 1 || dpad == 2 || dpad == 3)
    const square = normalizeButton(buttons0 & 0x10)
    const cross = normalizeButton(buttons0 & 0x20)
    const circle = normalizeButton(buttons0 & 0x40)
    const triangle = normalizeButton(buttons0 & 0x80)
    const l1 = normalizeButton(buttons1 & 0x01)
    const r1 = normalizeButton(buttons1 & 0x02)
    const l2 = normalizeButton(buttons1 & 0x04)
    const r2 = normalizeButton(buttons1 & 0x08)
    const create = normalizeButton(buttons1 & 0x10)
    const options = normalizeButton(buttons1 & 0x20)
    const l3 = normalizeButton(buttons1 & 0x40)
    const r3 = normalizeButton(buttons1 & 0x80)
    const ps = normalizeButton(buttons2 & 0x01)
    const touchpad = normalizeButton(buttons2 & 0x02)

    this.state.buttons.cross = cross
    this.state.buttons.circle = circle
    this.state.buttons.square = square
    this.state.buttons.triangle = triangle
    this.state.buttons.l1 = l1
    this.state.buttons.r1 = r1
    this.state.buttons.l2 = l2
    this.state.buttons.r2 = r2
    this.state.axes.l2 = l2axis
    this.state.axes.r2 = r2axis
    this.state.buttons.create = create
    this.state.buttons.options = options
    this.state.buttons.l3 = l3
    this.state.buttons.r3 = r3

    this.state.buttons.dPadUp = up
    this.state.buttons.dPadDown = down
    this.state.buttons.dPadLeft = left
    this.state.buttons.dPadRight = right

    this.state.buttons.playStation = ps
    this.state.buttons.touchPadClick = touchpad
    this.state.buttons.mute = false

    this.state.axes.leftStickX = lsx
    this.state.axes.leftStickY = lsy
    this.state.axes.rightStickX = rsx
    this.state.axes.rightStickY = rsy

    this.state.touchpad.touches = []

    this.state.battery.charging = false
    this.state.battery.full = false
    this.state.battery.level = NaN
    this.state.headphoneConnected = false

    this.emit('state-change', { detail: this.state })
  }

  #handleBluetoothInputReport31(report: DataView) {

    const axes0 = report.getUint8(1)
    const axes1 = report.getUint8(2)
    const axes2 = report.getUint8(3)
    const axes3 = report.getUint8(4)
    const axes4 = report.getUint8(5)
    const axes5 = report.getUint8(6)
    const buttons0 = report.getUint8(8)
    const buttons1 = report.getUint8(9)
    const buttons2 = report.getUint8(10)
    const gyroX = report.getInt16(16, true)
    const gyroY = report.getInt16(18, true)
    const gyroZ = report.getInt16(20, true)

    const accelX = report.getInt16(22, true)
    const accelY = report.getInt16(24, true)
    const accelZ = report.getInt16(26, true)
    const touch00 = report.getUint8(33)
    const touch01 = report.getUint8(34)
    const touch02 = report.getUint8(35)
    const touch03 = report.getUint8(36)
    const touch10 = report.getUint8(37)
    const touch11 = report.getUint8(38)
    const touch12 = report.getUint8(39)
    const touch13 = report.getUint8(40)
    const battery0 = report.getUint8(53)
    const battery1 = report.getUint8(54)

    const lsx = normalizeThumbStickAxis(axes0)
    const lsy = normalizeThumbStickAxis(axes1)
    const rsx = normalizeThumbStickAxis(axes2)
    const rsy = normalizeThumbStickAxis(axes3)
    const l2axis = normalizeTriggerAxis(axes4)
    const r2axis = normalizeTriggerAxis(axes5)

    const dpad = buttons0 & 0x0f
    const up = normalizeButton(dpad == 0 || dpad == 1 || dpad == 7)
    const down = normalizeButton(dpad == 3 || dpad == 4 || dpad == 5)
    const left = normalizeButton(dpad == 5 || dpad == 6 || dpad == 7)
    const right = normalizeButton(dpad == 1 || dpad == 2 || dpad == 3)
    const square = normalizeButton(buttons0 & 0x10)
    const cross = normalizeButton(buttons0 & 0x20)
    const circle = normalizeButton(buttons0 & 0x40)
    const triangle = normalizeButton(buttons0 & 0x80)
    const l1 = normalizeButton(buttons1 & 0x01)
    const r1 = normalizeButton(buttons1 & 0x02)
    const l2 = normalizeButton(buttons1 & 0x04)
    const r2 = normalizeButton(buttons1 & 0x08)
    const create = normalizeButton(buttons1 & 0x10)
    const options = normalizeButton(buttons1 & 0x20)
    const l3 = normalizeButton(buttons1 & 0x40)
    const r3 = normalizeButton(buttons1 & 0x80)
    const ps = normalizeButton(buttons2 & 0x01)
    const touchpad = normalizeButton(buttons2 & 0x02)
    const mute = normalizeButton(buttons2 & 0x04)

    const touch0active = !(touch00 & 0x80)
    const touch0id = touch00 & 0x7f
    const touch0x = ((touch02 & 0x0f) << 8) | touch01
    const touch0y = (touch03 << 4) | ((touch02 & 0xf0) >> 4)
    const touch1active = !(touch10 & 0x80)
    const touch1id = touch10 & 0x7f
    const touch1x = ((touch12 & 0x0f) << 8) | touch11
    const touch1y = (touch13 << 4) | ((touch12 & 0xf0) >> 4)

    const batteryLevelPercent = Math.min((battery0 & 0x0f) * 10 + 5, 100)
    const batteryFull = !!(battery0 & 0x20)
    const batteryCharging = !!(battery1 & 0x08)
    const headphoneConnected = !!(battery1 & 0x01)

    this.state.buttons.cross = cross
    this.state.buttons.circle = circle
    this.state.buttons.square = square
    this.state.buttons.triangle = triangle

    this.state.buttons.l1 = l1
    this.state.buttons.r1 = r1
    this.state.buttons.l2 = l2
    this.state.buttons.r2 = r2

    this.state.axes.l2 = l2axis
    this.state.axes.r2 = r2axis

    this.state.buttons.create = create
    this.state.buttons.options = options
    this.state.buttons.l3 = l3
    this.state.buttons.r3 = r3

    this.state.buttons.dPadUp = up
    this.state.buttons.dPadDown = down
    this.state.buttons.dPadLeft = left
    this.state.buttons.dPadRight = right

    this.state.buttons.playStation = ps
    this.state.buttons.touchPadClick = touchpad
    this.state.buttons.mute = mute

    this.state.axes.leftStickX = lsx
    this.state.axes.leftStickY = lsy
    this.state.axes.rightStickX = rsx
    this.state.axes.rightStickY = rsy

    this.state.touchpad.touches = []
    if (touch0active) {
      this.state.touchpad.touches.push({
        touchId: touch0id,
        x: touch0x,
        y: touch0y
      })
    }
    if (touch1active) {
      this.state.touchpad.touches.push({
        touchId: touch1id,
        x: touch1x,
        y: touch1y
      })
    }

    this.state.axes.gyroX = gyroX
    this.state.axes.gyroY = gyroY
    this.state.axes.gyroZ = gyroZ
    this.state.axes.accelX = accelX
    this.state.axes.accelY = accelY
    this.state.axes.accelZ = accelZ

    this.state.battery.charging = batteryCharging
    this.state.battery.full = batteryFull
    this.state.battery.level = batteryLevelPercent
    this.state.headphoneConnected = headphoneConnected

    this.emit('state-change', { detail: this.state })
  }

  onRAFBound = this.#onRAF.bind(this)
  #sendOutputReportBound = this.#sendOutputReport.bind(this)
  #setOutputReportDataBound = this.#setOutputReportData.bind(this)

  async #onRAF() {
    //setImmediate(this.#onRAFBound)
    if (this[PROPERTY_DEVICE]) {
      const sent = await this.#sendOutputReportBound()
      if (!sent) this.#onConnectionError()
    }
  }

  /**
   * Sends a Output Report to the controller.
   */
  async #sendOutputReport() {
    if (this.state.interface == DualSenseInterface.USB) {
      return await this.#sendOutputReportUSB()
    } else {
      return await this.#sendOutputReportBluetooth()
    }
  }

  /**
   * Sends a Output Report to the controller via USB.
   */
  async #sendOutputReportUSB() {
    const reportId = 0x02
    const reportData = new Uint8Array(47)

    const common = new DataView(reportData.buffer, 0, 47)
    const r2Effect = new DataView(common.buffer, 10, 8)
    const l2Effect = new DataView(common.buffer, 21, 8)

    // Set output report data
    this.#setOutputReportDataBound(common, r2Effect, l2Effect)

    // Send output report
    try {
      const buffer = Buffer.from([reportId, ...reportData])
      this[PROPERTY_DEVICE].write(buffer)
    } catch (error) {
      return false
    }

    return true
  }

  /**
   * Sends a Output Report to the controller via Bluetooth.
   */
  async #sendOutputReportBluetooth() {
    const reportId = 0x31
    const reportData = new Uint8Array(77)

    // seq
    reportData[0] = this.#outputSeq << 4
    if (++this.#outputSeq == 16) this.#outputSeq = 0

    // tag
    reportData[1] = 0x10 // DS_OUTPUT_TAG

    const common = new DataView(reportData.buffer, 2, 47)
    const r2Effect = new DataView(common.buffer, 12, 8)
    const l2Effect = new DataView(common.buffer, 23, 8)

    // Set output report data
    this.#setOutputReportDataBound(common, r2Effect, l2Effect)

    // crc32
    fillDualSenseChecksum(reportId, reportData)

    // Send output report
    try {
      const buffer = Buffer.from([reportId, ...reportData])
      this[PROPERTY_DEVICE].write(buffer)
    } catch (error) {
      return false
    }

    return true
  }

  /** Set output report data */
  #setOutputReportData(common: DataView, r2Effect: DataView, l2Effect: DataView) {
    // valid_flag0
    // bit 0: COMPATIBLE_VIBRATION
    // bit 1: HAPTICS_SELECT
    common.setUint8(0, 0xff)

    // valid_flag1
    // bit 0: MIC_MUTE_LED_CONTROL_ENABLE
    // bit 1: POWER_SAVE_CONTROL_ENABLE
    // bit 2: LIGHTBAR_CONTROL_ENABLE
    // bit 3: RELEASE_LEDS
    // bit 4: PLAYER_INDICATOR_CONTROL_ENABLE
    common.setUint8(1, 0xf7)

    // DualShock 4 compatibility mode.
    common.setUint8(2, this.output.motorRight)
    common.setUint8(3, this.output.motorLeft)

    // mute_button_led
    // 0: mute LED off
    // 1: mute LED on
    common.setUint8(8, this.output.micLight ? 0x01 : 0x00)

    // power_save_control
    // bit 4: POWER_SAVE_CONTROL_MIC_MUTE
    common.setUint8(9, this.output.micLight ? 0x00 : 0x10)

    // TODO: effect
    // r2Effect.setUint8(0, 0x00)
    // l2Effect.setUint8(0, 0x00)
    // r2Effect.setUint8(1, 0x00)
    // l2Effect.setUint8(1, 0x00)
    // r2Effect.setUint8(2, 0x00)
    // l2Effect.setUint8(2, 0x00)
    // r2Effect.setUint8(3, 0x00)
    // l2Effect.setUint8(3, 0x00)
    // r2Effect.setUint8(4, 0x00)
    // l2Effect.setUint8(4, 0x00)
    // r2Effect.setUint8(5, 0x00)
    // l2Effect.setUint8(5, 0x00)
    // r2Effect.setUint8(6, 0x00)
    // l2Effect.setUint8(6, 0x00)
    // r2Effect.setUint8(7, 0x00)
    // l2Effect.setUint8(7, 0x00)

    // trigger effect
    setTriggerEffect(l2Effect, this.output.leftTriggerEffect, this.output.leftTriggerEffectData)
    setTriggerEffect(r2Effect, this.output.rightTriggerEffect, this.output.rightTriggerEffectData)

    // player_leds
    common.setUint8(38, 3)

    // valid_flag2
    // bit 1: LIGHTBAR_SETUP_CONTROL_ENABLE
    common.setUint8(39, 0x02)

    // lightbar_setup
    // 1: Disable LEDs
    // 2: Enable LEDs
    common.setUint8(41, 0x02)

    // player_leds_brightness
    common.setUint8(42, this.output.playerLightBrightness)

    // player_leds
    // 0x00: LED off
    // 0x04: player 1
    // 0x0a: player 2
    // 0x15: player 3
    // 0x1b: player 4
    // 0x1f: all
    if (this.output.playerLight == 0) {
      common.setUint8(43, 0x00)
    } else if (this.output.playerLight == 1) {
      common.setUint8(43, 0x04)
    } else if (this.output.playerLight == 2) {
      common.setUint8(43, 0x0a)
    } else if (this.output.playerLight == 3) {
      common.setUint8(43, 0x15)
    } else if (this.output.playerLight == 4) {
      common.setUint8(43, 0x1b)
    } else if (this.output.playerLight == 5) {
      common.setUint8(43, 0x1f)
    }

    // Lightbar RGB
    common.setUint8(44, this.output.lightbar[0])
    common.setUint8(45, this.output.lightbar[1])
    common.setUint8(46, this.output.lightbar[2])
  }
}

const setTriggerEffect = (effect: DataView, effectMode: number, effectData: number[]) => {
  effect.setUint8(0, 0x00)
  effect.setUint8(1, 0x00)
  effect.setUint8(2, 0x00)
  effect.setUint8(3, 0x00)
  effect.setUint8(4, 0x00)
  effect.setUint8(5, 0x00)
  effect.setUint8(6, 0x00)
  effect.setUint8(7, 0x00)
  switch (effectMode) {
    case 0:
      // off
      break
    case 1:
      // resistance
      effect.setUint8(0, 0x01)
      // start pos
      effect.setUint8(1, effectData[0])
      // force
      effect.setUint8(2, effectData[1])
      break
    case 2:
      // soft trigger
      effect.setUint8(0, 0x02)

      // start pos
      effect.setUint8(1, effectData[0])
      // end pos
      effect.setUint8(2, effectData[1])
      // force
      effect.setUint8(3, effectData[2])
      break
    case 3:
      // automatic trigger
      effect.setUint8(0, 0x06)

      // start pos
      effect.setUint8(3, effectData[0])

      // force
      effect.setUint8(2, effectData[1])

      // frequency
      effect.setUint8(1, effectData[2])
      break
  }
}
