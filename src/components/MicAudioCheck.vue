<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue'
import { storeToRefs } from 'pinia';
import { useDualSenseStore } from '@/store/dualsense'

const dualsenseStore = useDualSenseStore()
const { isConnected, state } = storeToRefs(dualsenseStore)
const checkResult = ref<string | null>(null)
const emit = defineEmits(['checkResult'])

const performCheck = () => {
  if (isConnected.value) {
    // Perform some checks based on the DualSense state
    if (true /*state.headphoneConnected*/) {
      checkResult.value = 'The DualSense controller is functioning correctly.'
      emit('checkResult', true)  // Emit success result
    } else {
      checkResult.value = 'Issue detected: Battery level is too low. Please charge the controller.'
      // emit('checkResult', false)  // Emit failure result
    }
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
  padding: 10px;
  background-color: #f0f4f8;
  border-radius: 6px;
  color: #333;
}
</style>
