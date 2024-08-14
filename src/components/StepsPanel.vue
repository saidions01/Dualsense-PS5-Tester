<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStepStore } from '@/store/step'

const stepStore = useStepStore()
const { steps, currentStep } = storeToRefs(stepStore)
</script>

<template>
  <div class="steps-panel">
    <div
      class="step"
      v-for="(step, index) in steps"
      :key="step.id"
      :class="{
        'active-step': step.id === currentStep.id,
        'disabled-step': step.status === 'PENDING' && step.id !== currentStep.id,
        'completed-step': step.status === 'SUCCESS',
        'failed-step': step.status === 'FAIL'
      }"
    >
      <div class="step-number">{{ index + 1 }}</div>
      <div class="step-title">{{ step.name }}</div>

      <template v-if="step.status === 'SUCCESS'">
        <div class="check-icon">&#10003;</div>
      </template>

      <template v-if="step.status === 'FAIL'">
        <div class="fail-icon">&#10007;</div> <!-- Unicode "X" mark for fail -->
      </template>

      <template v-if="step.id === currentStep.id && step.status === 'PENDING'">
        <div class="loading-spinner"></div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.steps-panel {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.step {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.step-number {
  font-weight: bold;
  margin-right: 10px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
}

.step-title {
  font-size: 16px;
  color: #333;
  flex-grow: 1;
  transition: color 0.3s ease, font-weight 0.3s ease;
}

.active-step {
  background-color: #e3f2fd;
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
}

.active-step .step-title {
  font-weight: bold;
}

.disabled-step {
  opacity: 0.6;
}

.completed-step .step-title {
  color: #28a745;
  font-weight: bold;
}

.completed-step .step-number {
  background-color: #28a745;
}

.failed-step .step-title {
  color: #dc3545;
  font-weight: bold;
}

.failed-step .step-number {
  background-color: #dc3545;
}

.check-icon {
  font-size: 24px;
  color: #28a745;
  margin-left: 10px;
}

.fail-icon {
  font-size: 24px;
  color: #dc3545;
  margin-left: 10px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #007bff;
  border-top: 3px solid #e3f2fd;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.step:last-child {
  margin-bottom: 0;
}
</style>
