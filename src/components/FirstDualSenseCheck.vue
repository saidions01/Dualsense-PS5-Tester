<script setup lang="ts">
import { ref, onMounted, defineEmits, reactive } from 'vue' 
import { storeToRefs } from 'pinia' 
import { useDualSenseStore } from '@/store/dualsense' 
const dualsenseStore = useDualSenseStore() 
const { isConnected, state } = storeToRefs(dualsenseStore) 
const checkResult = ref<string | null>(null) 
const emit = defineEmits(['checkResult']) 
const allFalse = ref(true) 


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
      resolve(allFalse.value) 
    }, duration) 
  }) 
}

const performCheck = async () => {
  if (isConnected.value) {
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

onMounted(() => {
  performCheck() 
})
</script>

<template>
  <div class="dualsense-check">
    <p>{{ checkResult }}</p>
  </div>
</template>

<style scoped>
.dualsense-check {
  padding: 10px ;
  background-color: #f0f4f8 ;
  border-radius: 6px ;
  color: #333 
}
</style>
