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
