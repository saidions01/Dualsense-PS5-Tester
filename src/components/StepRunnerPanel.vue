<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStepStore } from '@/store/step'

const stepStore = useStepStore()
const { currentStep } = storeToRefs(stepStore)
</script>

<template>
  <div class="step-runner-panel">
    <h2>{{ currentStep.name }}</h2>
    <p v-if="currentStep.id === 1">Details about auto anomalies checking...</p>
    <p v-if="currentStep.id === 2">Details about basic buttons checking...</p>
    <p v-if="currentStep.id === 3">Details about light, rumble, and trigger checking...</p>
    <p v-if="currentStep.id === 4">Details about mic/audio checking...</p>
    <p v-if="currentStep.id === 5">Details about Bluetooth checking...</p>
  </div>
</template>

<style scoped>
.step-runner-panel {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>
