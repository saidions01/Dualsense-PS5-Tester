<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useDualSenseStore } from '@/store/dualsense'
import ContentTips from '@/components/common/ContentTips.vue'
import { storeToRefs } from 'pinia'
import { useStepStore } from '@/store/step'
// Use stores
const dualsenseStore = useDualSenseStore()
const { isConnected, state } = storeToRefs(dualsenseStore)
const stepStore = useStepStore()
const { currentSession } = storeToRefs(stepStore)
// Reactive variable to hold the current time spent
const currentTimeSpent = ref<string>('00:00:00')
// Function to calculate session time spent
const calculateSessionTimeSpent = (): void => {
  if (!currentSession.value || !currentSession.value.startDate) {
    currentTimeSpent.value = '00:00:00'
    return
  }
  const now = new Date();
  const duration = now.getTime() - new Date(currentSession.value.startDate).getTime()
  const hours = String(Math.floor(duration / (1000 * 60 * 60))).padStart(2, '0')
  const minutes = String(Math.floor((duration / (1000 * 60)) % 60)).padStart(2, '0')
  const seconds = String(Math.floor((duration / 1000) % 60)).padStart(2, '0')
  currentTimeSpent.value = `${hours}:${minutes}:${seconds}`
}
// Timer to update the time spent every second
let timer: ReturnType<typeof setInterval> | null = null;
// Start the timer
const startTimer = (): void => {
  if (!timer) {
    timer = setInterval(calculateSessionTimeSpent, 1000);
  }
}
// Stop the timer
const stopTimer = (): void => {
  if (timer) {
    clearInterval(timer);
    timer = null; // Reset the timer variable
  }
}
// Watch for changes in currentSession and isConnected
watch(
  () => currentSession.value?.globalStatus,
  (status) => {     
      if (status === "IN_PROGRESS") {
        startTimer(); // Start the timer if the session is active
      } else {
        stopTimer(); // Stop the timer if the session is successful
      }
  }
)
// Computed property to access the current time spent
const sessionTimeSpent = computed((): string => currentTimeSpent.value);
// Start the timer when the component is mounted
onMounted(() => {
  if (currentSession.value?.isActive) {
    startTimer(); // Start the timer if the session is already active
  }
})
// Clear the timer when the component is unmounted
onUnmounted(() => {
  stopTimer();
})
</script>
<template>
    <div class="dou-sc-container space-y-2 self-start w-full">
        <ContentTips v-if="!isConnected">
            <p v-html="$t('connect_panel.tips')"></p>
        </ContentTips>
        <div  v-if="currentSession?.isActive || isConnected">
            <table>
                <tr>
                    <td class="label">Session Time</td>
                    <td class="value">{{ sessionTimeSpent }}</td>
                </tr>
                <tr>
                    <td class="label">Session ID</td>
                    <td class="value">{{ currentSession?.id || 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="label">Serial Number</td>
                    <td class="value">{{ currentSession?.deviceSerialNumber || 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="label">Conencted via</td>
                    <td class="value flex items-center justify-end">
                        <div v-if="state.interface === 'bt'" class="i-mingcute-bluetooth-line"></div>
                        <div v-else class="i-mingcute-usb-line"></div>
                        <span class="ml-1">{{ state.interface === 'bt' ? 'Bluetooth' : 'USB' }}</span>
                    </td>
                </tr>
                <tr>
                    <td class="label">{{ $t('connect_panel.battery_level') }}</td>
                    <td class="value">{{ state.battery.level }}%</td>
                </tr>
                <tr>
                    <td class="label">{{ $t('connect_panel.battery_charging_state') }}</td>
                    <td class="value">{{ state.battery.charging ?
                        $t('connect_panel.battery_level_charging') : $t('connect_panel.battery_level_not_charging') }}
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<style scoped lang="scss">
table {
    @apply min-w-full w-0;

    .label {
        @apply text-primary/70 font-bold whitespace-pre-wrap;
    }

    .value {
        @apply opacity-70 text-right;
    }
}
</style>