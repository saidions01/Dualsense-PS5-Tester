<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStepStore } from '@/store/step'
import FirstDualSenseCheck from '@/components/FirstDualSenseCheck.vue'
import BasicButtonsCheck from '@/components/BasicButtonsCheck.vue';
import LightRumbleCheck from '@/components/LightRumbleCheck.vue';
import MicAudioCheck from '@/components/MicAudioCheck.vue';
import BluetoothCheck from '@/components/BluetoothCheck.vue';

const stepStore = useStepStore()
const { currentStep } = storeToRefs(stepStore)

const handleCheckResult = (isSuccess: boolean) => {
  if (isSuccess) {
    stepStore.setStepSuccess()  // Mark the current step as successful
  } else {
    stepStore.setStepFail()  // Fail the current step
  }
}
</script>

<template>
  <div class="step-runner-panel">
    <h1 class="dou-sc-subtitle">{{ currentStep?.name }}</h1>
    <!-- STEP 1: First Check -->
    <div v-if="currentStep?.id === 1">
      <FirstDualSenseCheck @checkResult="handleCheckResult" />
    </div>
    <!-- STEP 2: Basic buttons Check -->
    <div v-if="currentStep?.id === 2">
      <BasicButtonsCheck @checkResult="handleCheckResult" />
    </div>
    <!-- STEP 3:  light, rumble, and trigger Check -->
    <div v-if="currentStep?.id === 3">
      <LightRumbleCheck @checkResult="handleCheckResult" />
    </div>
    <!-- STEP 4: Mic/Audios Check -->
    <div v-if="currentStep?.id === 4">
      <MicAudioCheck @checkResult="handleCheckResult" />
    </div>
    <!-- STEP 5: Bluetooth Check -->
    <div v-if="currentStep?.id === 5">
      <BluetoothCheck @checkResult="handleCheckResult" />
    </div>
  </div>
</template>

<style scoped>
.step-runner-panel {
  padding: 20px;
  border-radius: 8px;
}
</style>
