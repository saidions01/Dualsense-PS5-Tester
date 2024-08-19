<script setup lang="ts">
import { useDualSenseStore } from '@/store/dualsense'
import SwitchBox from './common/SwitchBox.vue'
import ColorInput from './common/ColorInput.vue'
import { hexToRgb, rgbToHex } from '@/utils/color.util'
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import GroupedButton from './common/GroupedButton.vue'
import { useI18n } from 'vue-i18n'
import SelfResettingSlider from './common/SelfResettingSlider.vue'
import TriggerEffect from './TriggerEffect.vue'
const emit = defineEmits(['checkResult'])

const dualsenseStore = useDualSenseStore()
const { state } = storeToRefs(dualsenseStore)
const { t } = useI18n()

const totalSteps = 6 // Total number of steps you have

const currentStep = ref(0)
let micLightInterval: number | undefined
let lightbarInterval: number | undefined
let playerLightInterval: number | undefined
let playerLightBrightnessInterval: number | undefined
let rumbleHeavyInterval: number | undefined
let rumbleSoftInterval: number | undefined

const lightbarColor = computed({
  get: () => rgbToHex(dualsenseStore.output.lightbar),
  set: (value: string) => dualsenseStore.output.lightbar = hexToRgb(value)
})

const playerLightSets = computed(() => {
  return [
    { value: 0, label: t('output_panel.player_led_off') },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: t('output_panel.player_led_all') }
  ]
})

const playerLightBrightnessSets = computed(() => {
  return [
    { value: 0, label: t('output_panel.player_led_brightness_high') },
    { value: 1, label: t('output_panel.player_led_brightness_medium') },
    { value: 2, label: t('output_panel.player_led_brightness_low') }
  ]
})

// // Utility function to delay execution
// function delay(ms: number) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// Step 1: toggle mic
const toggleMicLight = () => {
  dualsenseStore.output.micLight = !dualsenseStore.output.micLight
  //micLightStatus.value = dualsenseStore.output.micLight ? 'ON' : 'OFF'
}

const startMicLightToggling = () => {
  micLightInterval = setInterval(() => {
    toggleMicLight()
  }, 1000) // Toggle every second
}

// Step 2: Lightbar color automation
const lightbarColors = ['#FF0000', '#00FF00', '#0000FF'] // Red, Green, Blue
let currentColorIndex = 1
const lightbarColorA = ref(lightbarColors[currentColorIndex])

const changeLightbarColor = () => {
  currentColorIndex = (currentColorIndex + 1) % lightbarColors.length
  lightbarColorA.value = lightbarColors[currentColorIndex]
  dualsenseStore.output.lightbar = hexToRgb(lightbarColorA.value)
}

const startLightbarColorToggling = () => {
  lightbarInterval = setInterval(() => {
    changeLightbarColor()
  }, 1000)
}

// Step 3: Player light automation
const playerLightSequence = [0, 1, 2, 3, 4, 5] // None, 1, 2, 3, 4, All
let currentPlayerLightIndex = 1

const changePlayerLight = () => {
  dualsenseStore.output.playerLight = playerLightSequence[currentPlayerLightIndex]
  currentPlayerLightIndex = (currentPlayerLightIndex + 1) % playerLightSequence.length
}

const startPlayerLightToggling = () => {
  playerLightInterval = setInterval(() => {
    changePlayerLight()
  }, 1000)
}
// Step 4: player light brightness automation
const playerLightBrightnessSequence = [0, 1, 3]
let currentPlayerLightBIndex = 1

const changePlayerLightBrightness = () => {
  dualsenseStore.output.playerLightBrightness = playerLightSequence[currentPlayerLightBIndex]
  currentPlayerLightBIndex = (currentPlayerLightBIndex + 1) % playerLightBrightnessSequence.length
}

const startPlayerLightBrightnessToggling = () => {
  playerLightBrightnessInterval = setInterval(() => {
    changePlayerLightBrightness()
  }, 1000)
}

// Step 5: Rumble (heavy) automation
const startRumbleHeavy = () => {
  let direction = 1
  let rumbleValue = 0
  rumbleHeavyInterval = setInterval(() => {
    rumbleValue += direction * 5
    if (rumbleValue >= 255 || rumbleValue <= 0) direction *= -1
    dualsenseStore.output.motorLeft = rumbleValue
  }, 50)
}

// Step 6: Rumble (soft) automation
const startRumbleSoft = () => {
  let direction = 1
  let rumbleValue = 0
  rumbleSoftInterval = setInterval(() => {
    rumbleValue += direction * 5
    if (rumbleValue >= 255 || rumbleValue <= 0) direction *= -1
    dualsenseStore.output.motorRight = rumbleValue
  }, 50)
}

// Automatically trigger the relevant event based on the current step
watch(currentStep, (newStep) => {
  switch (newStep) {
    case 1:
      startMicLightToggling()
      break
    case 2:
      startLightbarColorToggling()
      break
    case 3:
      startPlayerLightToggling()
      break
    case 4:
      startPlayerLightBrightnessToggling()
      break
    case 5:
      startRumbleHeavy()
      break
    case 6:
      startRumbleSoft()
      break
  }
})
// Watchers for button presses
watch(
  () => state.value.buttons.cross,
  async (newVal, oldVal) => {
    if (newVal && !oldVal) {
      stopAllActions() // Stop any ongoing actions from the previous step

      if (currentStep.value < totalSteps) {
        currentStep.value++
      } else {
        emit('checkResult', true)
      }
    }
  }
);
watch(
  () => state.value.buttons.triangle,
  (newVal, oldVal) => {
    if (newVal && !oldVal) {
      emit('checkResult', false)
    }
  }
)

onMounted(() => {
  currentStep.value = 1
});

// Stop all ongoing actions when user confirms the step
const stopAllActions = () => {

  clearInterval(micLightInterval)
  clearInterval(lightbarInterval)
  clearInterval(playerLightInterval)
  clearInterval(playerLightBrightnessInterval)
  clearInterval(rumbleHeavyInterval)
  clearInterval(rumbleSoftInterval)
  // Reset all configurations including the current step
  dualsenseStore.output.micLight = false
  dualsenseStore.output.lightbar = hexToRgb('#00FF00')
  dualsenseStore.output.playerLight = 5
  dualsenseStore.output.playerLightBrightness = 0
  dualsenseStore.output.motorLeft = 0
  dualsenseStore.output.motorRight = 0
}

// Ensure intervals are cleared when the component is destroyed
onBeforeUnmount(() => {
  stopAllActions()
})
</script>

<template>
  <div class="dou-sc-container space-y-2 self-start w-full">
    <table>
      <tr :class="{
        highlighted: currentStep === 1,
        confirmed: currentStep > 1,
        'not-passed': currentStep < 1
      }">
        <td class="label">{{ $t('output_panel.mic_mute_led') }}</td>
        <td class="value">
          <div>
            <SwitchBox v-model="dualsenseStore.output.micLight" />
          </div>
        </td>
      </tr>
      <tr :class="{
        highlighted: currentStep === 2,
        confirmed: currentStep > 2,
        'not-passed': currentStep < 2
      }">
        <td class="label">{{ $t('output_panel.lightbar_color') }}</td>
        <td class="value">
          <div>
            <ColorInput v-model="lightbarColor" />
          </div>
        </td>
      </tr>
      <tr :class="{
        highlighted: currentStep === 3,
        confirmed: currentStep > 3,
        'not-passed': currentStep < 3
      }">
        <td class="label">{{ $t('output_panel.player_led') }}</td>
        <td class="value">
          <div>
            <GroupedButton v-model="dualsenseStore.output.playerLight" :sets="playerLightSets" />
          </div>
        </td>
      </tr>
      <tr :class="{
        highlighted: currentStep === 4,
        confirmed: currentStep > 4,
        'not-passed': currentStep < 4
      }">
        <td class="label">{{ $t('output_panel.player_led_brightness') }}</td>
        <td class="value">
          <div>
            <GroupedButton v-model="dualsenseStore.output.playerLightBrightness" :sets="playerLightBrightnessSets" />
          </div>
        </td>
      </tr>
      <tr :class="{
        highlighted: currentStep === 5,
        confirmed: currentStep > 5,
        'not-passed': currentStep < 5
      }">
        <td class="label">{{ $t('output_panel.rumble_heavy') }}</td>
        <td class="value">
          <div>
            <SelfResettingSlider class="w-full" :min="0" :max="255" v-model="dualsenseStore.output.motorLeft" />
          </div>
        </td>
      </tr>
      <tr :class="{
        highlighted: currentStep === 6,
        confirmed: currentStep > 6,
        'not-passed': currentStep < 6
      }">
        <td class="label">{{ $t('output_panel.rumble_soft') }}</td>
        <td class="value">
          <div>
            <SelfResettingSlider class="w-full" :min="0" :max="255" v-model="dualsenseStore.output.motorRight" />
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>

<style scoped lang="scss">
table {
  @apply w-full;
  border-spacing: 0 1.5rem;
}

.label,
:deep(.label) {
  @apply text-primary/70 font-bold whitespace-pre-wrap pl-4;
}

.value,
:deep(.value) {
  @apply max-w-50% pl-2 pr-4;

  &>div {
    @apply flex items-center justify-end;
  }
}

// Highlighted current step
.highlighted {
  background-color: #ceeffc;
  border-left: 5px solid #007BFF;
  height: 5rem;
  opacity: 1;

  // Border animation
  border-left: 5px solid transparent;
  animation: borderAnimation 1s infinite;
}

// Confirmed steps
.confirmed {
  background-color: #ebffe9;
  border: 1px solid #c8cbcf;
  border-left: 5px solid #28a745;
  height: 5rem;
  opacity: 1;
}

// Steps that are not yet passed
.not-passed {
  opacity: 0.5; // Reduced opacity for steps not yet passed
  height: 3rem; // Standard height for steps
}

// Define the border animation for the current step
@keyframes borderAnimation {
  0% {
    border-color: transparent;
  }

  50% {
    border-color: #007BFF;
  }

  100% {
    border-color: transparent;
  }
}
</style>
