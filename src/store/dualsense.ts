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
  const state = ref<DualSenseState>({} as DualSenseState)
  const output = reactive({})

  const initializeDualSense = () => {
    const ds = new DualSense({ persistCalibration: true })
    dualsense.value = ds
    state.value = ds.state
    Object.assign(output, ds.output)

    watch(output, (newOutput) => {
      if (dualsense.value) {
        dualsense.value.output = newOutput
      }
    })

    ds.addEventListener('connected', () => {
      isConnected.value = true
    })

    ds.addEventListener('disconnected', () => {
      isConnected.value = false
    })

    const updateState = (detail: DualSenseState) => {
      state.value = { ...detail }
    }

    const throttledUpdateState = throttle(updateState, 10)

    ds.addEventListener('state-change', ({ detail }: { detail: DualSenseState }) => {
      throttledUpdateState(detail)
    })
  }

  if (window.electron) {
    window.electron.receive('dualsense-connected', (device) => {
      console.log('DualSense connected message received', device)
      initializeDualSense()
      isConnected.value = true
    })

    window.electron.receive('dualsense-disconnected', () => {
      console.log('DualSense disconnected message received')
      dualsense.value = null
      isConnected.value = false
    })
  }

  return {
    dualsense,
    isConnected,
    state: readonly(state),
    output
  }
})
