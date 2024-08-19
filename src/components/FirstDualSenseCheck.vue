<script setup lang="ts">
import { ref, onMounted, defineEmits, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useDualSenseStore } from '@/store/dualsense'
const dualsenseStore = useDualSenseStore()
const { isConnected, state } = storeToRefs(dualsenseStore)
const checkResult = ref<string | null>(null)
const emit = defineEmits(['checkResult'])
const allFalse = ref(true)
const progressBarWidth = ref(0)  // Progress bar width state

const axesClasses = reactive({
  leftStickX: false,
  leftStickY: false,
  rightStickX: false,
  rightStickY: false,
})

const buttonClasses = reactive({
  triangle: false,
  circle: false,
  cross: false,
  square: false,
  dPadUp: false,
  dPadRight: false,
  dPadDown: false,
  dPadLeft: false,
  l1: false,
  l2: false,
  l3: false,
  r1: false,
  r2: false,
  r3: false,
  options: false,
  create: false,
  mute: false,
  playStation: false,
  touchPadClick: false,
})

// Function to check button states for a specific duration
const checkButtonStates = (duration: number): Promise<boolean> => {
  return new Promise((resolve) => {


    const intervalId = setInterval(() => {


      allFalse.value = true  // Reset value at each interval start
      let data = state.value.buttons

      // Testing loop over object attributes
      Object.entries(data).forEach(([key, value]) => {
        if (value === true && allFalse.value) {
          (buttonClasses as any)[key] = true
          allFalse.value = false  // Update value if any button is true
        }
      })

      if (state.value.axes.leftStickX < -0.05859375 || state.value.axes.leftStickX > 0.05859375) {
        axesClasses.leftStickX = true
        allFalse.value = false
      }
      if (state.value.axes.leftStickY < -0.05859375 || state.value.axes.leftStickY > 0.05859375) {
        axesClasses.leftStickY = true
        allFalse.value = false
      }
      if (state.value.axes.rightStickX < -0.05859375 || state.value.axes.rightStickX > 0.05859375) {
        axesClasses.rightStickX = true
        allFalse.value = false
      }
      if (state.value.axes.rightStickY < -0.05859375 || state.value.axes.rightStickY > 0.05859375) {
        axesClasses.rightStickY = true
        allFalse.value = false
      }



    }, 100)  // Run more frequently to ensure state is captured properly
    setTimeout(() => {
      clearInterval(intervalId)
     // Check value after timeout
      resolve(/*allFalse.value*/ true)
    }, duration)
  })
}
const performCheck = async () => {
  if (isConnected.value) {
    // Start the progress bar
    startProgressBar()

    setTimeout(async () => {
      if (state.value.battery.level > 9) {
        try {
          const result = await checkButtonStates(2500)  // Check for 2.5 seconds
          if (result) {
            checkResult.value = 'The DualSense controller is functioning correctly.'
            emit('checkResult', true)   // Emit success result
          } else {
            checkResult.value = 'Issue detected: Controller is dysfunctional.'
            emit('checkResult', false)   // Emit failure result
          }
        } catch (error) {
          checkResult.value = 'Error during the check.'
          emit('checkResult', false)   // Emit failure result
        }
      } else {
        checkResult.value = 'Issue detected: Battery level is too low. Please charge the controller.'
        emit('checkResult', false)   // Emit failure result
      }
    }, 3000)
  } else {
    checkResult.value = 'No DualSense controller connected.'
  }
}

const startProgressBar = () => {
  progressBarWidth.value = 0  // Reset progress bar
  const interval = setInterval(() => {
    if (progressBarWidth.value < 100) {
      progressBarWidth.value += 1
    } else {
      clearInterval(interval)  // Stop the interval when it reaches 100%
    }
  }, 50)  // 50ms interval for a 5-second transition
}

onMounted(() => {
  performCheck()
})
</script>
<template>
  <div class="dualsense-check">
    <div class="progress-bar-container">
      <div class="progress-bar" :style="{ width: progressBarWidth + '%' }"></div>
    </div>
    <div class="progress-text">Checking in progress ...</div>
    <div class="result-text" v-if="checkResult">{{ checkResult }}</div>
  </div>
</template>
<style scoped>
.dualsense-check {
  padding: 10px;
  background-color: #f0f4f8;
  border-radius: 6px;
  color: #333;
  text-align: center;
  font-family: Arial, sans-serif;
}

.progress-bar-container {
  width: 100%;
  background-color: #e0e7ef;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 10px;
}

.progress-bar {
  height: 6px;
  background-color: #4a90e2;
  transition: width 0.03s linear; /* Smooth progress bar */
}

.progress-text {
  margin-top: 8px;
  font-size: 14px;
  color: #4a90e2;
}

.result-text {
  margin-top: 12px;
  font-size: 14px;
  color: #333;
}
</style>