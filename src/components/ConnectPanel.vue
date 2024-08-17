<script setup lang="ts">
import { useDualSenseStore } from '@/store/dualsense'
import ContentTips from '@/components/common/ContentTips.vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useStepStore } from '@/store/step'

const dualsenseStore = useDualSenseStore()
const { isConnected, state } = storeToRefs(dualsenseStore)
const stepStore = useStepStore()
const { currentSession } = storeToRefs(stepStore)

// Computed property to calculate session time spent in hh:mm:ss format
const sessionTimeSpent = computed(() => {
  if (!currentSession.value || !currentSession.value.startDate) return '00:00:00'
  const now = new Date()
  const duration = now.getTime() - new Date(currentSession.value.startDate).getTime()
  const hours = String(Math.floor(duration / (1000 * 60 * 60))).padStart(2, '0')
  const minutes = String(Math.floor((duration / (1000 * 60)) % 60)).padStart(2, '0')
  const seconds = String(Math.floor((duration / 1000) % 60)).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
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
