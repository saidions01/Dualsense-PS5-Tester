<script setup lang="ts">
import { useDualSenseStore } from '@/store/dualsense';
import { storeToRefs } from 'pinia';
import { reactive, ref, watch, toRaw, defineEmits, computed } from 'vue';
import { useStepStore } from '@/store/step';
import AccelValueBar from './AccelValueBar.vue'
const stepStore = useStepStore()
const checkResult = ref<string | null>(null)
const emit = defineEmits(['checkResult'])
const dualsenseStore = useDualSenseStore()
const { isConnected, state } = storeToRefs(dualsenseStore)
const TouchpadGroupRef = ref<SVGElement | null>(null)
const TOUCHPAD_LEFT = 340
const TOUCHPAD_TOP = 160
const TOUCHPAD_REAL_WIDTH = 430
const TOUCHPAD_REAL_HEIGHT = 235
const TOUCHPAD_RANGEX = 1920
const TOUCHPAD_RANGEY = 1080
const TOUCHPAD_XF = TOUCHPAD_REAL_WIDTH / TOUCHPAD_RANGEX
const TOUCHPAD_YF = TOUCHPAD_REAL_HEIGHT / TOUCHPAD_RANGEY
// variables for bd to manage touchpad validation
let tdr = '', tdl = '', tupr = '', tupl = ''
//controle variables of pressing and time
let boutonsPressedNames = ref(new Set<string>())
let boutonsPressedTime = []
let longPressedBoutons = []
// variables from python project
let sn_consol = '', ar = '', bat = '', level = '', al = '', br11 = 'not pressed', bl11 = 'not pressed',
  br22 = 'not pressed', bl22 = 'not pressed', bl = 'not pressed', bup = 'not pressed', br = 'not pressed',
  bdown = 'not pressed', fg = '', bg = '', rg = '', lg = '', bcc = 'not pressed', bt = 'not pressed', bc = 'not pressed',
  bsq = 'not pressed', bcr = 'not pressed', bo = 'not pressed', btp = 'not pressed',
  bar3 = 'not pressed', bal3 = 'not pressed', alxl = '', alxr = '', alydown = '', alyup = '', arxl = '', arxr = '', arydown = '',
  aryup = '', bpss = 'not pressed', bmic = 'not pressed', vr = '', vl = '', L2_TP1 = '', R2_TP1 = '', L2_TP2 = '', R2_TP2 = '',
  L2_TP3 = '', R2_TP3 = '', LED_light = '', Bluetooth = '', bal2 = '', bar2 = ''
// declaring touch interface
interface Touch {
  touchId: number;
  x: number;
  y: number;
  active: boolean;
}
// objects we worked with in the store in the previous try
const testAxesObject = reactive({
  leftStickX: 0,
  leftStickY: 0,
  rightStickX: 0,
  rightStickY: 0,
  l2: 0,
  r2: 0,
  accelX: 0,
  accelY: 0,
  accelZ: 0,
  gyroX: 0,
  gyroY: 0,
  gyroZ: 0
})
interface Coordinates {
  x: number
  y: number
}
const testobject = reactive({
  squareHasEverBeenTrue: (false),
  triangleHasEverBeenTrue: (false),
  circleHasEverBeenTrue: (false),
  crossHasEverBeenTrue: (false),
  dPadUpHasEverBeenTrue: false,
  dPadRightHasEverBeenTrue: false,
  dPadDownHasEverBeenTrue: false,
  dPadLeftHasEverBeenTrue: false,
  l1HasEverBeenTrue: false,
  l2HasEverBeenTrue: false,
  l3HasEverBeenTrue: false,
  r1HasEverBeenTrue: false,
  r2HasEverBeenTrue: false,
  r3HasEverBeenTrue: false,
  optionsHasEverBeenTrue: false,
  createHasEverBeenTrue: false,
  muteHasEverBeenTrue: false,
  playStationHasEverBeenTrue: false,
  touchPadClickHasEverBeenTrue: false,
})
let touchpadActive = ref(false) // Track if the touchpad is active
let touchpadState = ref<{ x: number; y: number } | null>(null) // Track the last touch position
let touchpadCoordinatesValues: Coordinates[] = []
let valueCheckingForTheWholeTouchpad = []
const arrOfBooleans = reactive<Coordinates[]>([])
// Flags to track if a variable has reached the desired value
let leftXminReached = false
let leftXmaxReached = false
let leftYminReached = false
let leftYmaxReached = false
let rightXminReached = false
let rightXmaxReached = false
let rightYminReached = false
let rightYmaxReached = false
let zoneTopRight = {
  xmin: 0,
  xmax: 400,
  ymin: 0,
  ymax: 500
}
let zoneTopMiddle = {
  xmin: 400,
  xmax: 1500,
  ymin: 0,
  ymax: 500
}
let zoneTopleft = {
  xmin: 1500,
  xmax: 1920,
  ymin: 0,
  ymax: 500
}
let zoneBottomRight = {
  xmin: 0,
  xmax: 400,
  ymin: 500,
  ymax: 1020
}
let zoneBottomMiddle = {
  xmin: 400,
  xmax: 1500,
  ymin: 500,
  ymax: 1020
}
let zoneBottomleft = {
  xmin: 1500,
  xmax: 1920,
  ymin: 500,
  ymax: 1020
}
let rightStickOk = reactive({
  rightStickXmin: false,
  rightStickXmax: false,
  rightStickYmin: false,
  rightStickYmax: false
})
let leftStickOk = reactive({
  leftStickXmin: false,
  leftStickXmax: false,
  leftStickYmin: false,
  leftStickYmax: false
})
const getTouchPointX = (x: number) => {
  arrOfBooleans.push({ x, y: 0 })
  return x * TOUCHPAD_XF + TOUCHPAD_LEFT
}
const getTouchPointY = (y: number) => {
  const lastObject = arrOfBooleans[arrOfBooleans.length - 1]
  if (lastObject) {
    lastObject.y = y
  }
  return y * TOUCHPAD_YF + TOUCHPAD_TOP
}
const STICK_REAL_REDIUS = 40
const getStickPoint = (x: number) => {
  return STICK_REAL_REDIUS * x
}
const handleButtonsPress = () => {
  let detail = { ...state.value }
  //conditions to check if the buttons and axes have been pressed even once
  if (detail.buttons.square === true) {
    testobject.squareHasEverBeenTrue = true
    bsq = "OK"
    boutonsPressedNames.value.add("square")
  }
  if (detail.buttons.triangle === true) {
    testobject.triangleHasEverBeenTrue = true
    bt = "OK"
    boutonsPressedNames.value.add("triangle")
  }
  if (detail.buttons.circle === true) {
    testobject.circleHasEverBeenTrue = true
    bcc = "OK"
    boutonsPressedNames.value.add("circle")
  }
  if (detail.buttons.cross === true) {
    testobject.crossHasEverBeenTrue = true
    bc = "OK"
    boutonsPressedNames.value.add("cross")
  }
  if (detail.buttons.l1 === true) {
    testobject.l1HasEverBeenTrue = true
    bl11 = "OK"
    boutonsPressedNames.value.add("l1")
  }
  if (detail.buttons.l2 === true) {
    testobject.l2HasEverBeenTrue = true
    bl22 = "OK"
    boutonsPressedNames.value.add("l2")
  }
  if (detail.buttons.l3 === true) {
    testobject.l3HasEverBeenTrue = true
    bal3 = "OK"
    boutonsPressedNames.value.add("l3")
  }
  if (detail.buttons.r1 === true) {
    testobject.r1HasEverBeenTrue = true
    br11 = "OK"
    boutonsPressedNames.value.add("r1")
  }
  if (detail.buttons.r2 === true) {
    testobject.r2HasEverBeenTrue = true
    br22 = "OK"
    boutonsPressedNames.value.add("r2")
  }
  if (detail.buttons.r3 === true) {
    testobject.r3HasEverBeenTrue = true
    bar3 = "OK"
    boutonsPressedNames.value.add("r3")
  }
  if (detail.buttons.options === true) {
    testobject.optionsHasEverBeenTrue = true
    bo = "OK"
    boutonsPressedNames.value.add("options")
  }
  if (detail.buttons.create === true) {
    testobject.createHasEverBeenTrue = true
    bcr = "OK"
    boutonsPressedNames.value.add("create")
  }
  if (detail.buttons.mute === true) {
    testobject.muteHasEverBeenTrue = true
    bmic = "OK"
    boutonsPressedNames.value.add("mute")
  }
  if (detail.buttons.playStation === true) {
    testobject.playStationHasEverBeenTrue = true
    bpss = "OK"
    boutonsPressedNames.value.add("playStation")
  }
  if (detail.buttons.touchPadClick === true) {
    testobject.touchPadClickHasEverBeenTrue = true
    btp = "OK"
    boutonsPressedNames.value.add("touchPadClick")
  }
  if (detail.buttons.dPadRight === true) {
    testobject.dPadRightHasEverBeenTrue = true
    br = "OK"
    boutonsPressedNames.value.add("dPadRight")
  }
  if (detail.buttons.dPadUp === true) {
    testobject.dPadUpHasEverBeenTrue = true
    bup = "OK"
    boutonsPressedNames.value.add("dPadUp")
  }
  if (detail.buttons.dPadDown === true) {
    testobject.dPadDownHasEverBeenTrue = true
    bdown = "OK"
    boutonsPressedNames.value.add("dPadDown")
  }
  if (detail.buttons.dPadLeft === true) {
    testobject.dPadLeftHasEverBeenTrue = true
    bl = "OK"
    boutonsPressedNames.value.add("dPadLeft")
  }
  if (detail.axes.l2 === 1) {
    testAxesObject.l2 = 1
    bal2 = "OK"
    boutonsPressedNames.value.add("axes.l2")
  }
  if (detail.axes.r2 === 1) {
    testAxesObject.r2 = 1
    bar2 = "OK"
    boutonsPressedNames.value.add("axes.r2")
  }
  if (detail.axes.leftStickX === 1 || detail.axes.leftStickX === -1) {
    testAxesObject.leftStickX = detail.axes.leftStickX
    boutonsPressedNames.value.add("leftStickX")
  }
  if (detail.axes.leftStickY === 1 || detail.axes.leftStickY === -1) {
    testAxesObject.leftStickY = detail.axes.leftStickY
    boutonsPressedNames.value.add("leftStickY")
  }
  if (detail.axes.rightStickX === 1 || detail.axes.rightStickX === -1) {
    testAxesObject.rightStickX = detail.axes.rightStickX
    boutonsPressedNames.value.add("rightStickX")
  }
  if (detail.axes.rightStickY === 1 || detail.axes.rightStickY === -1) {
    testAxesObject.rightStickY = detail.axes.rightStickY
    boutonsPressedNames.value.add("rightStickY")
  }
}
// Function to handle touchpad start
const handleTouchStart = (x: number, y: number) => {
  touchpadActive.value = true;
  touchpadState.value = { x, y };
  touchpadCoordinatesValues.push(toRaw(touchpadState.value))
  valueCheckingForTheWholeTouchpad[0] = touchpadCoordinatesValues.some(element => {
    return element.x >= zoneTopRight.xmin && element.x <= zoneTopRight.xmax
      && element.y >= zoneTopRight.ymin && element.y <= zoneTopRight.ymax
  })
}
// Function to handle touchpad move
const handleTouchMove = (x: number, y: number) => {
  if (touchpadActive.value) {
    touchpadState.value = { x, y };
    console.log('WHILE FINGER IS MOVING, here is the array ', toRaw(touchpadState.value))
    touchpadCoordinatesValues.push(toRaw(touchpadState.value))
    valueCheckingForTheWholeTouchpad[1] = touchpadCoordinatesValues.some(element => {
      return element.x >= zoneTopMiddle.xmin && element.x <= zoneTopMiddle.xmax
        && element.y >= zoneTopMiddle.ymin && element.y <= zoneTopMiddle.ymax
    })
    valueCheckingForTheWholeTouchpad[2] = touchpadCoordinatesValues.some(element => {
      return element.x >= zoneTopleft.xmin && element.x <= zoneTopleft.xmax
        && element.y >= zoneTopleft.ymin && element.y <= zoneTopleft.ymax
    })
    valueCheckingForTheWholeTouchpad[3] = touchpadCoordinatesValues.some(element => {
      return element.x >= zoneBottomRight.xmin && element.x <= zoneBottomRight.xmax
        && element.y >= zoneBottomRight.ymin && element.y <= zoneBottomRight.ymax
    })
    valueCheckingForTheWholeTouchpad[4] = touchpadCoordinatesValues.some(element => {
      return element.x >= zoneBottomMiddle.xmin && element.x <= zoneBottomMiddle.xmax
        && element.y >= zoneBottomMiddle.ymin && element.y <= zoneBottomMiddle.ymax
    })
  }
}
// Function to handle touchpad end
const handleTouchEnd = () => {
  let checkValues = false
  if (touchpadState.value) {
    const { x, y } = touchpadState.value;
    // Check if the final values are within the valid range
    if (x >= 0 && x <= TOUCHPAD_RANGEX && y >= 0 && y <= TOUCHPAD_RANGEY) {
      touchpadCoordinatesValues.push(toRaw(touchpadState.value))
    }
    // Assign the CSS class to the TouchpadGroupRef
    valueCheckingForTheWholeTouchpad[5] = touchpadCoordinatesValues.some(element => {
      return element.x >= zoneBottomleft.xmin && element.x <= zoneBottomleft.xmax
        && element.y >= zoneBottomleft.ymin && element.y <= zoneBottomleft.ymax
    })
    checkValues = valueCheckingForTheWholeTouchpad.every(element => element === true)
    if (TouchpadGroupRef.value && checkValues) {
      const touchpadElement = TouchpadGroupRef.value.querySelector("#touchpad");
      if (touchpadElement) {
        tdr = "OK"
        tdl = "OK"
        tupl = "OK"
        tupr = "OK"
        touchpadElement.classList.add("ds-valid")
        boutonsPressedNames.value.add("touchpadElement")
      }
    }
  } else {
    console.log('Touchpad touch ended outside the valid range');
  }
  touchpadActive.value = false
  touchpadState.value = null
}
// test analogue
// Method to check the sticks
const checkSticks = () => {
  let detail = { ...state.value }
  // Check for left stick extremes
  if (detail.axes.leftStickX === -1 && !leftXminReached) {
    leftStickOk.leftStickXmin = true
    leftXminReached = true
    boutonsPressedNames.value.add("leftXminReached")
  }
  if (detail.axes.leftStickX === 1 && !leftXmaxReached) {
    leftStickOk.leftStickXmax = true
    leftXmaxReached = true
    boutonsPressedNames.value.add("leftXmaxReached")
  }
  if (detail.axes.leftStickY === -1 && !leftYminReached) {
    leftStickOk.leftStickYmin = true
    leftYminReached = true
    boutonsPressedNames.value.add("leftYminReached")
  }
  if (detail.axes.leftStickY === 1 && !leftYmaxReached) {
    leftStickOk.leftStickYmax = true
    leftYmaxReached = true
    boutonsPressedNames.value.add("leftYmaxReached")
  }
  // Check for right stick extremes
  if (detail.axes.rightStickX === -1 && !rightXminReached) {
    rightStickOk.rightStickXmin = true
    rightXminReached = true
    boutonsPressedNames.value.add("rightXminReached")
  }
  if (detail.axes.rightStickX === 1 && !rightXmaxReached) {
    rightStickOk.rightStickXmax = true
    rightXmaxReached = true
    boutonsPressedNames.value.add("rightXmaxReached")
  }
  if (detail.axes.rightStickY === -1 && !rightYminReached) {
    rightStickOk.rightStickYmin = true
    rightYminReached = true
    boutonsPressedNames.value.add("rightYminReached")
  }
  if (detail.axes.rightStickY === 1 && !rightYmaxReached) {
    rightStickOk.rightStickYmax = true
    rightYmaxReached = true
    boutonsPressedNames.value.add("rightYmaxReached")
  }
}
const performCheck = (setSize: number) => {
  if (isConnected.value) {
    // Check for set length
    if (setSize === 40) {
      checkResult.value = 'The DualSense controller is functioning correctly.';
      emit('checkResult', true); // Emit success result
    }
  } else {
    checkResult.value = 'Issue detected: Controller is dysfunctional.';
    console.log("not working")
  }
}
let firstActiveTouch = computed(() => {
  return state.value.touchpad.touches.find((touch: Touch) => touch.active) || null;
})
// Watch for changes in the touchpad touches and allFalse
// Watch for touch events
watch(
  () => state.value.touchpad.touches,
  (touches) => {
    if (touches.length > 0) {
      const touch = touches[0];
      handleTouchStart(touch.x, touch.y); // Call start handler for the first touch
      handleTouchMove(touch.x, touch.y); // Call move handler for the first touch
    } else if (touchpadActive.value) {
      handleTouchEnd(); // Call end handler if no touches are detected
    }
  },
  { immediate: true } // Execute immediately on creation
)
// Watch for changes in the sticks
watch(
  () => [state.value.axes],
  async () => {
    checkSticks()
  },
  { immediate: true } // Execute immediately on creation
)
// Watch for button being pressed
watch(
  () => [state.value.buttons],
  async () => {
    handleButtonsPress()
  },
  {} // Execute immediately on creation
)
//
watch(
  () => boutonsPressedNames.value.size,
  (newSize) => {
    performCheck(newSize)
  },
  {} // Execute immediately on creation
)
let checkMinPitch=false,checkMaxPitch=false,checkMinYaw=false,checkMaxYaw=false,checkMinRoll=false,checkMaxRoll=false
const checkGyro=(pitch:number,yaw:number,roll:number)=>{
  const minVal = -3000;
    const maxVal = 3000;
    // Check conditions
    if (pitch < minVal && checkMinPitch===false) {
        checkMinPitch = true;
        boutonsPressedNames.value.add('Minpitch')
    }
    if (pitch > maxVal && checkMaxPitch===false) {
        checkMaxPitch = true;
        boutonsPressedNames.value.add('Maxpitch')
    }
    if (yaw < minVal && !checkMinYaw) {
      checkMinYaw = true;
      boutonsPressedNames.value.add('Minyaw')
    }
    if (yaw > maxVal && !checkMaxYaw) {
      checkMaxYaw = true;
      boutonsPressedNames.value.add('Maxyaw')
    }
    if (roll < minVal && !checkMinRoll) {
      checkMinRoll = true;
      boutonsPressedNames.value.add('Minroll')
    }
    if (roll > maxVal && !checkMaxRoll) {
      checkMaxRoll = true;
      boutonsPressedNames.value.add('Maxroll')
    }
}

watch(
  () => [state.value.axes.gyroX, state.value.axes.gyroY, state.value.axes.gyroZ],
  () => {
    checkGyro(state.value.axes.gyroX, state.value.axes.gyroY, state.value.axes.gyroZ)
  }
);
watch(
  () => isConnected.value,
  (newValue) => {
    if (!newValue) emit('checkResult', false); // Emit failure result
  },
  {} // Execute immediately on creation
)
</script>
<template>
  <svg viewBox="0 0 1117 892" ref="SvgElement">
    <path id="r2"
      d="M866.471,116.785l114.214,0c12.312,0 -1.248,-110.916 -78.919,-110.916c-37.32,-0 -51.81,110.916 -35.295,110.916Z"
      class="ds-stroke-normal" :class="{ 'ds-valid': testobject.r2HasEverBeenTrue }" :style="{
        '--un-fill-opacity': testAxesObject.r2
      }" />
    <path id="l2"
      d="M252.212,116.785l-114.214,0c-12.312,0 1.248,-110.916 78.919,-110.916c37.32,-0 51.81,110.916 35.295,110.916Z"
      class="ds-stroke-normal" :class="{ 'ds-valid': testobject.l2HasEverBeenTrue }" :style="{
        '--un-fill-opacity': testAxesObject.l2
      }" />
    <g id="dpad-up">
      <path
        d="M213.487,271.996c0,-11.214 -9.091,-20.305 -20.305,-20.305l-28.888,-0c-11.215,-0 -20.306,9.091 -20.306,20.305l0,24.336c0,6.286 2.397,12.335 6.703,16.915c6.856,7.293 17.331,18.436 23.351,24.838c1.218,1.296 2.917,2.031 4.696,2.031c1.778,-0 3.478,-0.735 4.696,-2.031c6.019,-6.402 16.494,-17.545 23.35,-24.838c4.306,-4.58 6.703,-10.629 6.703,-16.915c0,-6.766 0,-16.013 0,-24.336Z"
        class="ds-stroke-normal" :class="{ 'ds-valid': testobject.dPadUpHasEverBeenTrue }" />
      <path d="M168.337,270.016l18.658,0l-9.081,-9.08l-9.577,9.08Z" class="ds-filled-icon" />
    </g>
    <g id="dpad-down">
      <path
        d="M213.487,443.093c0,11.215 -9.091,20.306 -20.305,20.306l-28.888,-0c-11.215,-0 -20.306,-9.091 -20.306,-20.306l0,-24.125c0,-6.412 2.494,-12.572 6.953,-17.178c6.884,-7.11 17.23,-17.796 23.166,-23.927c1.214,-1.254 2.885,-1.962 4.631,-1.962c1.745,0 3.416,0.708 4.63,1.962c5.936,6.131 16.282,16.817 23.166,23.927c4.46,4.606 6.953,10.766 6.953,17.178c0,6.746 0,15.888 0,24.125Z"
        class="ds-stroke-normal" :class="{ 'ds-valid': testobject.dPadDownHasEverBeenTrue }" />
      <path d="M168.337,445.073l18.658,0l-9.081,9.08l-9.577,-9.08Z" class="ds-filled-icon" />
    </g>
    <g id="dpad-right">
      <path
        d="M263.75,322.259c11.215,0 20.306,9.091 20.306,20.306l-0,28.888c-0,11.214 -9.091,20.305 -20.306,20.305l-24.349,0c-6.278,0 -12.32,-2.391 -16.899,-6.687c-7.081,-6.644 -17.749,-16.654 -23.907,-22.433c-1.274,-1.195 -2.008,-2.855 -2.035,-4.601c-0.027,-1.746 0.656,-3.428 1.892,-4.661c6.106,-6.094 16.81,-16.778 23.946,-23.901c4.63,-4.621 10.905,-7.216 17.446,-7.216c6.724,0 15.758,0 23.906,0Z"
        class="ds-stroke-normal" :class="{ 'ds-valid': testobject.dPadRightHasEverBeenTrue }" />
      <path d="M265.73,367.409l0,-18.657l9.081,9.08l-9.081,9.577Z" class="ds-filled-icon" />
    </g>
    <g id="dpad-left">
      <path
        d="M93.725,322.259c-11.214,0 -20.306,9.091 -20.306,20.306l0,28.888c0,11.214 9.092,20.305 20.306,20.305l24.349,0c6.278,0 12.321,-2.391 16.899,-6.687c7.081,-6.644 17.749,-16.654 23.908,-22.433c1.273,-1.195 2.007,-2.855 2.034,-4.601c0.027,-1.746 -0.656,-3.428 -1.891,-4.661c-6.106,-6.094 -16.81,-16.778 -23.947,-23.901c-4.63,-4.621 -10.904,-7.216 -17.446,-7.216c-6.724,0 -15.757,0 -23.906,0Z"
        class="ds-stroke-normal" :class="{ 'ds-valid': testobject.dPadLeftHasEverBeenTrue }" />
      <path d="M91.745,367.409l0,-18.657l-9.08,9.08l9.08,9.577Z" class="ds-filled-icon" />
    </g>
    <circle id="cross" cx="934.079" cy="428.08" r="34.957" class="ds-stroke-normal"
      :class="{ 'ds-valid': testobject.crossHasEverBeenTrue }" />
    <circle id="square" cx="864.079" cy="358.08" r="34.957" class="ds-stroke-normal"
      :class="{ 'ds-valid': testobject.squareHasEverBeenTrue }" />
    <circle id="circle" cx="1004.08" cy="358.08" r="34.957" class="ds-stroke-normal"
      :class="{ 'ds-valid': testobject.circleHasEverBeenTrue }" />
    <circle id="triangle" cx="934.079" cy="288.08" r="34.957" class="ds-stroke-normal"
      :class="{ 'ds-valid': testobject.triangleHasEverBeenTrue }" />
    <path d="M917.682,411.683l32.795,32.795m-0,-32.795l-32.795,32.795" class="ds-stroke-icon" />
    <rect x="847.313" y="341.648" width="32.865" height="32.865" class="ds-stroke-icon" />
    <path d="M934.079,271.403l20.206,33.355l-40.411,-0l20.205,-33.355Z" class="ds-stroke-icon" />
    <circle cx="1004.08" cy="358.08" r="19.1" class="ds-stroke-icon" />
    <path id="border1"
      d="M100.97,881.749c8.551,1.607 62.356,4.094 68.38,-3.153c33.93,-40.827 69.521,-154.237 85.416,-196.14c9.791,-25.813 35.4,-37.881 67.491,-40.687c30.597,13.569 45.149,13.982 96.708,3.594l280.228,-0c51.559,10.388 66.111,9.975 96.708,-3.594c32.091,2.806 57.701,14.874 67.492,40.687c15.894,41.903 51.486,155.313 85.416,196.14c6.023,7.247 59.828,4.76 68.38,3.153"
      class="ds-stroke-normal" />
    <path id="border2" d="M282.527,168.559c13.841,1.794 27.682,-1.16 41.522,-6.511" class="ds-stroke-normal" />
    <path id="mute"
      d="M590.061,591.266c-0,-3.699 -2.999,-6.698 -6.698,-6.698c-11.914,0 -36.653,0 -48.567,0c-3.7,0 -6.698,2.999 -6.698,6.698c-0,0.001 -0,0.001 -0,0.002c-0,3.699 2.998,6.698 6.698,6.698c11.914,-0 36.653,-0 48.567,-0c3.699,-0 6.698,-2.999 6.698,-6.698c-0,-0.001 -0,-0.001 -0,-0.002Z"
      class="ds-stroke-normal" :class="{ 'ds-valid': testobject.muteHasEverBeenTrue }" />
    <path id="border3" d="M835.33,168.559c-13.84,1.794 -27.681,-1.16 -41.522,-6.511" class="ds-stroke-normal" />
    <path id="right-hat"
      d="M820.718,193.129c5.479,-25.983 25.744,-37.755 62.283,-33.901c40.742,4.297 79.814,11.918 115.424,22.309c11.905,3.474 23.486,8.273 28.39,18.67c91.01,192.963 106.846,408.796 55.912,643.084c-2.947,13.555 -9.046,24.221 -21.05,32.104c-5.842,3.836 -12.586,7.06 -21.885,9.445c-21.563,5.529 -31.041,-9.866 -33.637,-23.758c-33.415,-178.821 -88.678,-342.348 -191.662,-450.233c-9.318,-9.761 -18.181,-31.681 -20.635,-51.733c-0.97,-7.926 -0.451,-15.333 0.462,-22.036c6.052,-44.414 16.477,-96.901 26.398,-143.951Z"
      class="ds-stroke-normal" />
    <path id="left-hat"
      d="M296.668,193.129c-5.479,-25.983 -25.743,-37.755 -62.282,-33.901c-40.742,4.297 -79.814,11.918 -115.424,22.309c-11.905,3.474 -23.487,8.273 -28.39,18.67c-91.01,192.963 -106.846,408.796 -55.913,643.084c2.947,13.555 9.046,24.221 21.05,32.104c5.843,3.836 12.587,7.06 21.886,9.445c21.562,5.529 31.041,-9.866 33.636,-23.758c33.416,-178.821 88.679,-342.348 191.663,-450.233c9.318,-9.761 18.181,-31.681 20.635,-51.733c0.969,-7.926 0.451,-15.333 -0.463,-22.036c-6.051,-44.414 -16.477,-96.901 -26.398,-143.951Z"
      class="ds-stroke-normal" />

    <g id="touchpadgroup" ref="TouchpadGroupRef">

      <path id="touchpad"
        d="M559.079,143.015c0,0 158.534,-0.805 226.555,15.497c12.437,2.981 21.237,14.507 19.467,24.644c-8.942,51.221 -20.354,109.033 -30.53,160.023c-8.029,40.224 -40.893,53.816 -68.431,53.692c-27.538,-0.124 -147.061,-0.559 -147.061,-0.559c0,0 -119.522,0.435 -147.06,0.559c-27.538,0.124 -60.403,-13.468 -68.431,-53.692c-10.177,-50.99 -21.589,-108.802 -30.531,-160.023c-1.77,-10.137 7.031,-21.663 19.467,-24.644c68.021,-16.302 226.555,-15.497 226.555,-15.497Z"
        class="ds-stroke-normal" :class="{ 'ds-touchpad-active': testobject.touchPadClickHasEverBeenTrue }" stroke-width="10" />
      <circle v-if="firstActiveTouch" :key="firstActiveTouch.touchId" r="19" class="ds-filled-icon"
        :cx="getTouchPointX(firstActiveTouch.x)" :cy="getTouchPointY(firstActiveTouch.y)" />
    </g>
    <path id="r1"
      d="M995.675,180.421c-0.736,-29.244 -151.654,-71.59 -148.099,-18.465c9.518,-3.397 21.562,-4.367 36.227,-2.82c39.392,4.154 77.223,11.417 111.872,21.285Z"
      class="ds-stroke-normal" :class="{ 'ds-valid': testobject.r1HasEverBeenTrue }" />
    <path id="l1"
      d="M122.514,180.513c0.736,-29.244 151.654,-71.59 148.099,-18.465c-9.518,-3.397 -21.562,-4.367 -36.227,-2.82c-39.392,4.154 -77.223,11.417 -111.872,21.285Z"
      class="ds-stroke-normal" :class="{ 'ds-valid': testobject.l1HasEverBeenTrue }" />
    <path id="options"
      d="M839.082,206.321l-6.369,31.916c-0,-0 -2.557,11.875 11.724,14.725c14.281,2.849 16.478,-9.098 16.478,-9.098l6.4,-32.075c0,-0 2.559,-11.876 -11.74,-14.645c-14.298,-2.77 -16.493,9.177 -16.493,9.177Z"
      class="ds-stroke-normal" :class="{ 'ds-valid': testobject.optionsHasEverBeenTrue }" />
    <path id="create"
      d="M281.064,206.321l6.369,31.916c-0,-0 2.557,11.875 -11.724,14.725c-14.281,2.849 -16.478,-9.098 -16.478,-9.098l-6.4,-32.075c-0,-0 -2.559,-11.876 11.739,-14.645c14.299,-2.77 16.494,9.177 16.494,9.177Z"
      class="ds-stroke-normal" :class="{ 'ds-valid': testobject.createHasEverBeenTrue }" />
    <g id="create-icon">
      <path d="M262.694,188.058l-4.528,-7.079l4.528,7.079Z" class="ds-stroke-normal" />
      <path d="M269.717,185.341l-0,-8.725l-0,8.725Z" class="ds-stroke-normal" />
      <path d="M275.535,188.058l5.186,-7.079" class="ds-stroke-normal" />
    </g>
    <g id="options-icon">
      <path d="M856.893,174.616l-13.987,0l13.987,0Z" class="ds-stroke-normal" />
      <path d="M856.893,180.337l-13.987,0l13.987,0Z" class="ds-stroke-normal" />
      <path d="M856.893,186.058l-13.987,-0" class="ds-stroke-normal" />
    </g>
    <g id="r3group">
      <circle id="r3-border" cx="763.456" cy="528.548" r="87.347" class="ds-stroke-normal" />
      <circle id="r3" cx="763.456" cy="528.548" r="57.193" class="ds-stroke-normal ds-stick"
        :class="{ 'ds-valid': testobject.r3HasEverBeenTrue }" :style="{
          transform: `translate(${getStickPoint(state.axes.rightStickX)}px, ${getStickPoint(state.axes.rightStickY)}px)`
        }" />
      <path id="l2"
        d="M252.212,116.785l-114.214,0c-12.312,0 1.248,-110.916 78.919,-110.916c37.32,-0 51.81,110.916 35.295,110.916Z"
        class="ds-stroke-normal" :class="{ 'ds-valid': testobject.l2HasEverBeenTrue }" :style="{
          '--un-fill-opacity': testAxesObject.l2
        }" />
    </g>
    <g id="r3group" v-if="rightXmaxReached && rightXminReached
      && rightYmaxReached && rightYminReached">
      <circle id="r3-border" cx="763.456" cy="528.548" r="87.347" class="ds-stroke-normal ds-valid" />
      <circle id="r3" cx="763.456" cy="528.548" r="57.193" class="ds-stroke-normal ds-stick"
        :class="{ 'ds-valid': testobject.r3HasEverBeenTrue }" :style="{
          transform: `translate(${getStickPoint(state.axes.rightStickX)}px, ${getStickPoint(state.axes.rightStickY)}px)`
        }" />
    </g>
    <g id="l3group">
      <circle id="l3-border" cx="351.764" cy="528.548" r="87.347" class="ds-stroke-normal" />
      <circle id="l3" cx="351.764" cy="528.548" r="57.193" class="ds-stroke-normal ds-stick"
        :class="{ 'ds-valid': testobject.l3HasEverBeenTrue }" :style="{
          transform: `translate(${getStickPoint(state.axes.leftStickX)}px, ${getStickPoint(state.axes.leftStickY)}px)`
        }" />
    </g>
    <g id="l3group" v-if="leftXmaxReached && leftXminReached
      && leftYmaxReached && leftYminReached">
      <circle id="l3-border" cx="351.764" cy="528.548" r="87.347" class="ds-stroke-normal ds-valid" />
      <circle id="l3" cx="351.764" cy="528.548" r="57.193" class="ds-stroke-normal ds-stick"
        :class="{ 'ds-valid': testobject.l3HasEverBeenTrue }" :style="{
          transform: `translate(${getStickPoint(state.axes.leftStickX)}px, ${getStickPoint(state.axes.leftStickY)}px)`
        }" />
    </g>
    <path id="ps"
      d="M525.1,538.049c-6.333,-1.817 -7.382,-5.56 -4.509,-7.734c2.071,-1.361 4.45,-2.545 6.969,-3.436l0.232,-0.072l18.72,-6.713l-0,7.71l-13.419,4.906c-2.351,0.905 -2.751,2.108 -0.798,2.754c0.974,0.248 2.089,0.392 3.239,0.392c1.641,-0 3.212,-0.291 4.666,-0.822l-0.094,0.029l6.462,-2.353l-0,6.915c-0.4,0.099 -0.854,0.147 -1.299,0.243c-2.068,0.363 -4.448,0.571 -6.875,0.571c-4.744,0 -9.3,-0.795 -13.547,-2.257l0.293,0.088l-0.04,-0.221Zm39.449,0.789l20.99,-7.584c2.383,-0.859 2.753,-2.084 0.819,-2.727c-0.968,-0.237 -2.078,-0.373 -3.222,-0.373c-1.66,-0 -3.255,0.288 -4.733,0.813l0.099,-0.029l-14.02,5l0,-7.958l0.801,-0.283c2.801,-0.931 6.093,-1.654 9.489,-2.03l0.221,-0.022c1.249,-0.133 2.695,-0.208 4.16,-0.208c5.007,0 9.809,0.883 14.254,2.505l-0.288,-0.093c6.16,2.003 6.8,4.906 5.252,6.907c-1.491,1.486 -3.294,2.662 -5.303,3.42l-0.104,0.035l-28.484,10.359l-0,-7.654l0.069,-0.078Zm-15.521,-54.146l-0,58.498l13.051,4.204l-0,-49.061c-0,-2.3 1.013,-3.836 2.646,-3.303c2.121,0.601 2.534,2.713 2.534,5.018l0,19.587c8.137,3.978 14.543,-0.008 14.543,-10.508c-0,-10.791 -3.754,-15.585 -14.796,-19.427c-4.762,-1.729 -10.778,-3.452 -16.933,-4.815l-1.037,-0.193l-0.008,0Z"
      class="ds-ps-icon" :class="{ 'ds-valid': testobject.playStationHasEverBeenTrue }" />
  </svg>
  <br>
  <br>
  <div class="flex items-start">
    <AccelValueBar :title="$t('info_panel.pitch')" :value="state.axes.gyroX"  />
    <div class="pl-5 w-10 h-10 text-green-500" v-if="checkMinPitch && checkMaxPitch">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      class="w-full h-full"  >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="5"
        d="M5 13l4 4L19 7" />
    </svg>
  </div>
  </div>
  <div class="flex items-start">
    <AccelValueBar :title="$t('info_panel.yaw')" :value="state.axes.gyroY"  />
    <div class="pl-5 w-10 h-10 text-green-500" v-if="checkMinYaw && checkMaxYaw">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      class="w-full h-full">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="5"
        d="M5 13l4 4L19 7" />
    </svg>
  </div>
  </div>
  <div class="flex items-start">
    <AccelValueBar :title="$t('info_panel.roll')" :value="state.axes.gyroZ"  />
    <div class="pl-5 w-10 h-10 text-green-500" v-if="checkMinRoll && checkMaxRoll">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      class="w-full h-full" >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="5"
        d="M5 13l4 4L19 7"  />
    </svg>
  </div>
  </div>
</template>
<style scoped lang="scss">
svg {
  @apply w-full;

  #touchpadgroup {
    @apply relative;

    circle {
      @apply absolute;
    }
  }
  .ds-stroke-icon {
    @apply stroke-4px stroke-black/50 dark-stroke-white/50 fill-none;
  }

  .ds-filled-icon {
    @apply fill-black/50 dark-fill-white/50;
  }
  .ds-stroke-normal {
    @apply stroke-4px stroke-black/80 dark-stroke-white/80 fill-none;
  }
  .ds-ps-icon {
    @apply fill-black/20 dark-fill-white/20;
  }
  .ds-stick {
    @apply fill-white dark-fill-black;
  }
  .ds-touchpad-active {
    @apply stroke-primary ; /* Apply Tailwind utilities */
    stroke-width: 15px;
  }
  .ds-valid {
    @apply fill-green-500; // Apply the red fill
    fill: rgb(18, 202, 18) !important; // Force the red color using !important
  }
}

.dualsense-check {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 5px;
  height: 600px;
}
</style>
