import { defineStore } from 'pinia'
import { DualSense, type DualSenseState } from 'dualsense.js'
import { reactive, readonly, ref, watch } from 'vue'

function throttle<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: number | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) return
    timer = window.setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

export const useDualSenseStore = defineStore('dualsense', () => {
  const dualsense = ref<DualSense | null>(null)
  const isConnected = ref(false)
  const dualsenseId = ref(null)
  const state = ref<DualSenseState>({} as DualSenseState)
  const output = reactive({})

  const initializeDualSense = async () => {
    const ds = await window.electron.getDualSense()
    if (ds) {
      dualsense.value = ds
      state.value = ds.state
      Object.assign(output, ds.output)

      // Watch for changes in the output object and send them via IPC
      watch(output, (newOutput) => {
        if (dualsense.value) {
          dualsense.value.output = newOutput
        }
        sendOutputReportToMainProcess(newOutput)
      }, { deep: true }) // Deep watch to observe nested properties
    }
  }

  const sendOutputReportToMainProcess = (newOutput: any) => {
    console.log('Sending updated output to main process:', newOutput)
    window.electron.sendOutputReport(JSON.parse(JSON.stringify(newOutput)))
  }

  window.electron.receive('ds-connected', () => {
    console.log("================ ds-connected")
    isConnected.value = true
    dualsenseId.value = dualsense.value.serialNumber || `DS00001-${Date.now()}`
  })

  window.electron.receive('ds-disconnected', () => {
    console.log("================ ds-disconnected")
    isConnected.value = false
  })

  const updateState = (detail: DualSenseState) => {
    state.value = { ...detail }
  }

  const throttledUpdateState = throttle(updateState, 10)

  window.electron.receive('ds-state-change', ({ detail }: { detail: DualSenseState }) => {
    // console.log("================ ds-state-change", detail)
    throttledUpdateState(detail)
  })

  initializeDualSense()

  return {
    dualsense,
    dualsenseId, // Dualsense Serial Number
    isConnected,
    state: readonly(state),
    output
  }
})
