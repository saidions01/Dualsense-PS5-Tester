
<script lang="ts">
import { ref, onMounted, defineEmits, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDualSenseStore } from "@/store/dualsense";
import ConnectToBluetooth from './ConnectToBluetooth.vue';
import UnplugUSB from "./UnplugUSB.vue";


  export default {
  components: {
    ConnectToBluetooth,
    UnplugUSB,
  },
  setup() {
  
const dualsenseStore = useDualSenseStore()
const { isConnected, state } = storeToRefs(dualsenseStore)
const checkResult = ref<string | null>(null)
const emit = defineEmits(['checkResult'])

const performCheck = () => {
  if (isConnected.value) {
    console.log("state.value.interface ------------------ ", state.value.interface);
    setTimeout(() => {
      console.log("state.value.interface ------------------ ", state.value.interface);
      if (state.value.interface === "bt") {
        checkResult.value = "The DualSense controller is connected via Bluetooth correctly.";
        emit("checkResult", true); // Emit success result
      } else {
        checkResult.value = "Waiting to connect to Bluetooth or failing step...";
      }
    }, 500);
  } else {
    checkResult.value = "No DualSense controller connected.";
  }
};

watch(
  () => isConnected.value,
  () => {
    performCheck()
  }
)
// Watcher for triangle button press
watch(
  () => state.value.buttons.triangle,
  (newVal, oldVal) => {
    if (newVal && !oldVal) {
      emit('checkResult', false);
    }
  }
);

onMounted(() => {
  performCheck();
});

    return {
      isConnected, state
    };
  },
};


</script>

<template>
  <div class="dualsense-check">
    <UnplugUSB v-if="isConnected" />
    <ConnectToBluetooth v-else-if="!isConnected" />
  </div>
</template>

<style scoped>
.blinking-text {
  display: flex;
  justify-content: center;
  align-content: center;
  font-weight: bold;
  animation: blink-animation 2s steps(5, start) infinite;
  color: blue;
  font-size: 16px;
  text-align: center;
  padding: 10px;
}

#ps {
  animation: blink-animation 2s steps(5, start) infinite;
  fill: blue;
}

#create {
  animation: blink-animation 2s steps(5, start) infinite;
  fill: blue;
}

@keyframes blink-animation {
  0%,
  100% {
    visibility: visible;
  }

  50% {
    visibility: hidden;
  }
}

.dualsense-check {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 5px;
  height: 600px;
}

svg {
  @apply w-full;

  #touchpadgroup {
    @apply relative;
  }

  .ds-stroke-icon {
    @apply stroke-4px stroke-black/50 dark-stroke-white/50 fill-none;
  }

  .ds-filled-icon {
    @apply fill-black/50 dark-fill-white/50;
  }

  .ds-stroke-normal {
    @apply stroke-4px stroke-black/80 dark-stroke-white/80 fill-none;
  }

  .ds-ps-icon {
    @apply fill-black/20 dark-fill-white/20;
  }

  .ds-stick {
    @apply fill-white dark-fill-black;
  }
}
</style>
