import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Define a type for each step
interface Step {
  id: number
  name: string
  status: 'PENDING' | 'SUCCESS' | 'FAIL'
}

// Define a type for the session
interface Session {
  id: string
  startDate: Date
  duration?: number
  userId: string
  steps: Step[]
  globalStatus: 'OK' | 'KO' | 'IN_PROGRESS'
  deviceSerialNumber: string
}

export const useStepStore = defineStore('step', () => {
  const sessionActive = ref(false)
  const currentSession = ref<Session | null>(null)
  const currentStepIndex = ref(0)

  const steps = ref<Step[]>([
    { id: 1, name: 'First Auto checking', status: 'PENDING' },
    { id: 2, name: 'Basic Buttons checking', status: 'PENDING' },
    { id: 3, name: 'Light / Rumble / Trigger checking', status: 'PENDING' },
    { id: 4, name: 'Mic/Audio checking', status: 'PENDING' },
    { id: 5, name: 'Bluetooth checking', status: 'PENDING' },
  ])

  const currentStep = computed(() => steps.value[currentStepIndex.value])

  const globalStatus = computed(() => {
    if (steps.value.some(step => step.status === 'FAIL')) return 'KO'
    if (steps.value.every(step => step.status === 'SUCCESS')) return 'OK'
    return 'IN_PROGRESS'
  })

  function startNewSession() {
    const newSessionId = `sess-${Date.now()}`
    const userId = 'user-123' // This would be dynamically set
    const deviceSerialNumber = 'DS-00001' // Dynamically fetched from device
    currentSession.value = {
      id: newSessionId,
      startDate: new Date(),
      userId,
      steps: steps.value,
      globalStatus: 'IN_PROGRESS',
      deviceSerialNumber,
    }
    steps.value.forEach(step => step.status = 'PENDING')
    currentStepIndex.value = 0
    sessionActive.value = true
  }

  function goToNextStep() {
    if (sessionActive.value && currentStepIndex.value < steps.value.length - 1) {
      currentStepIndex.value += 1
    }
  }

  function setStepSuccess() {
    if (!sessionActive.value) return

    steps.value[currentStepIndex.value].status = 'SUCCESS'
    saveProgressToDatabase(currentSession.value!)
    if (currentStepIndex.value < steps.value.length - 1) {
      goToNextStep()
    } else {
      endSession()
    }
  }

  function setStepFail() {
    if (!sessionActive.value) return

    steps.value[currentStepIndex.value].status = 'FAIL'
    saveProgressToDatabase(currentSession.value!)
    endSession() // End the session immediately on failure
  }

  function endSession() {
    if (!currentSession.value) return
    currentSession.value.globalStatus = globalStatus.value
    currentSession.value.duration = Date.now() - currentSession.value.startDate.getTime()
    sessionActive.value = false
    saveProgressToDatabase(currentSession.value)
    console.log('Session Ended:', currentSession.value)
  }

  async function saveProgressToDatabase(session: Session) {
    console.log(`Saving session:`, session)
    // Implement the actual API call here
  }

  return {
    steps,
    currentStep,
    globalStatus,
    sessionActive,
    currentSession,
    startNewSession,
    setStepSuccess,
    setStepFail,
    goToNextStep,
    endSession,
  }
})
