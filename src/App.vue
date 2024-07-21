<script setup lang="ts">
import { storeToRefs } from 'pinia';
import MainFooter from './components/MainFooter.vue';
import MainHeader from './components/MainHeader.vue';
import ConnectPanel from './components/ConnectPanel.vue';
import InfoPanel from './components/InfoPanel.vue';
import { useDualSenseStore } from './store/dualsense';
import OutputPanel from './components/OutputPanel.vue';

const dualsenseStore = useDualSenseStore();
const { isConnected } = storeToRefs(dualsenseStore);
</script>

<template>
  <MainHeader />

  <main>
    <div class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-3 min-h-[var(--min-height)]">
      <div class="flex flex-col gap-3 items-start">
        <ConnectPanel />
        <OutputPanel v-if="isConnected" />
      </div>
      <div class="dou-sc-container">
        <InfoPanel />
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
</style>
