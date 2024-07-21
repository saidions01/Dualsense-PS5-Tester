<script setup lang="ts">
import { useDualSenseStore } from '@/store/dualsense'
import ContentTips from '@/components/common/ContentTips.vue'
import { storeToRefs } from 'pinia'

const dualsenseStore = useDualSenseStore()
const { isConnected, state } = storeToRefs(dualsenseStore)
</script>

<template>
    <div class="dou-sc-container space-y-2 self-start w-full">
        <ContentTips v-if="!isConnected">
            <p v-html="$t('connect_panel.tips')"></p>
        </ContentTips>
        <div v-if="isConnected">
            <table>
                <tr>
                    <td class="label">{{ $t('connect_panel.report_time') }}</td>
                    <td class="value">{{ state.timestamp.toFixed(2) }}</td>
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
                <tr>
                    <td class="label">{{ $t('connect_panel.headphone_connect_state') }}</td>
                    <td class="value">{{ state.headphoneConnected ? $t('connect_panel.connected') :
                        $t('connect_panel.not_connected') }}</td>
                </tr>
            </table>
        </div>
        <div class="flex items-center justify-between">
            <div class="flex items-center text-primary/80">
                <div v-if="!isConnected">{{ $t('connect_panel.not_connected') }}</div>
                <template v-else>
                    <div v-if="state.interface === 'bt'" class="i-mingcute-bluetooth-line"></div>
                    <div v-else class="i-mingcute-usb-line"></div>
                    <span class="ml-1">{{ $t('connect_panel.connected') }}</span>
                </template>
            </div>
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
