<script setup lang="ts">
import { storeToRefs } from 'pinia'
import MainFooter from './components/MainFooter.vue'
import MainHeader from './components/MainHeader.vue'
import ConnectPanel from './components/ConnectPanel.vue'
import StepsPanel from './components/StepsPanel.vue'
import StepRunnerPanel from './components/StepRunnerPanel.vue'
import { useDualSenseStore } from './store/dualsense'
import { useStepStore } from '@/store/step'

const dualsenseStore = useDualSenseStore()
const { isConnected } = storeToRefs(dualsenseStore)
const stepStore = useStepStore()
const { globalStatus,sessionActive } = storeToRefs(stepStore)

const handleSetStepSuccess = () => {
  stepStore.setStepSuccess()
}

const handleSetStepFail = () => {
  stepStore.setStepFail()
}

const handleStartNewSession = () => {
  stepStore.startNewSession()
}
</script>

<template>
  <MainHeader />

  <main>
    <div class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-3 min-h-[var(--min-height)]">
      <div class="flex flex-col gap-3 items-start">
        <ConnectPanel />
        <StepsPanel v-if="sessionActive" />
        <!-- for test -->
        <div class="button-container" v-if="sessionActive">
          <button @click="handleSetStepSuccess">Set Step Success</button>
          <button @click="handleSetStepFail">Set Step Fail</button>
        </div>
      </div>
      <!-- Display StepRunnerPanel and the final result -->
      <div class="dou-sc-container">
        <StepRunnerPanel v-if="sessionActive" />
        <div v-else class="result-screen" :class="globalStatus === 'OK' ? 'success' : 'fail'">
          <div class="result-content">
            <span class="result-icon">
              <span v-if="globalStatus === 'OK'">✓</span>
              <span v-else>✖</span>
            </span>
            <h2>Final Result: {{ globalStatus }}</h2>
            <button @click="handleStartNewSession">Start New Session</button>
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
  background-color: rgba(0, 0, 0, 0.5);
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
  background-color: rgba(114, 245, 145, 0.8); /* Green background with opacity */
}

.result-screen.fail {
  background-color: rgba(241, 105, 119, 0.8); /* Red background with opacity */
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