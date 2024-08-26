<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import MainFooter from './components/MainFooter.vue'
import MainHeader from './components/MainHeader.vue'
import ConnectPanel from './components/ConnectPanel.vue'
import StepsPanel from './components/StepsPanel.vue'
import StepRunnerPanel from './components/StepRunnerPanel.vue'
import { useDualSenseStore } from './store/dualsense'
import { useStepStore } from '@/store/step'

const dualsenseStore = useDualSenseStore()
const { isConnected, dualsenseId } = storeToRefs(dualsenseStore)
const stepStore = useStepStore()
const { currentSession, currentStep } = storeToRefs(stepStore)

watch(dualsenseId, (newSerialNumber) => {
  if (newSerialNumber) {
    stepStore.checkAndStartNewSession(newSerialNumber)
  }
})

const handleSetStepSuccess = () => {
  stepStore.setStepSuccess()
}

const handleSetStepFail = () => {
  stepStore.setStepFail()
}

</script>

<template>
  <MainHeader />

  <main>
    <div class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-3 min-h-[var(--min-height)]">
      <div class="flex flex-col gap-3 items-start">
        <ConnectPanel />
        <StepsPanel v-if="currentSession?.isActive || isConnected" />
        <!-- for test -->
        <div class="button-container" v-if="currentSession?.isActive">
          <button @click="handleSetStepSuccess">Set Step Success</button>
          <button @click="handleSetStepFail">Set Step Fail</button>
        </div>
        <div class="dou-sc-container space-y-2 self-start w-full legende h-full" v-if="currentSession?.isActive">
          <div v-if="currentStep?.id === 2">
            <h2 class="warning">⚠️ Warning: Unplugging the USB cable will cause this step to fail!</h2>
            <img src="./assets/legende_fail_by_cable.png" width="300px">
          </div>
          <div v-else-if="currentStep?.id === 3">
            <h2 class="info pb-2">ℹ️ Info: Press (cross) to succeed the step or press (triangle) to fail.</h2>
            <img src="./assets/legende_fail_success.png" width="300px">
          </div>
          <div v-else-if="currentStep?.id === 4" width="250px">
            <h2 class="info pb-2">ℹ️ Info: Press (triangle) to fail the step.</h2>
            <img src="./assets/legende_fail.png">
          </div>
        </div>
      </div>
      <!-- Display StepRunnerPanel and the final result -->
      <div class="dou-sc-container">
        <StepRunnerPanel v-if="currentSession?.isActive" />
        <div v-else-if="currentSession?.globalStatus === 'OK' || currentSession?.globalStatus === 'KO'">
          <div class="result-screen" :class="currentSession?.globalStatus === 'OK' ? 'success' : 'fail'">
            <div class="result-content">
              <span class="result-icon">
                <span v-if="currentSession?.globalStatus === 'OK'">✓</span>
                <span v-else>✖</span>
              </span>
              <h2>Final Result: {{ currentSession?.globalStatus }}</h2>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="result-screen">
            <h2>Please connect your DualSense to start test....</h2>
          </div>
        </div>
      </div>

    </div>
  </main>
  <MainFooter />
</template>

<style scoped>
main {
  --min-height: calc(100vh - 5rem - 4rem);
  min-height: var(--min-height);
  @apply w-full max-w-[--max-width] mx-auto px-2;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.button-container button {
  border: 1px solid #ccc;
  border-radius: 24px;
  padding: 0 15px;
}

/* Result Screen Styling */
.result-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: rgba(88, 87, 87, 0.5);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: white;
  font-size: 24px;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.result-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.result-screen.success {
  background-color: rgba(114, 245, 145, 0.8);
}

.result-screen.fail {
  background-color: rgba(241, 105, 119, 0.8);
}

.result-screen h2 {
  font-size: 48px;
  color: white;
  font-weight: bold;
}

/* Unicode Icons */
.result-icon span {
  font-size: 80px;
}
</style>