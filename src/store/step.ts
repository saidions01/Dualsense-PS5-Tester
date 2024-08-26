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
  isActive: boolean
}

export const useStepStore = defineStore('step', () => {
  const currentSession = ref<Session | null>(null)
  const currentStepIndex = ref(0)

  const currentStep = computed(() => currentSession.value?.steps[currentStepIndex.value] || null)

  const startNewSession = (deviceSerialNumber: string) => {
    const newSessionId = `sess-${Date.now()}`
    const userId = 'user-123' // This would be dynamically set
    currentSession.value = {
      id: newSessionId,
      startDate: new Date(),
      userId,
      steps: [
        { id: 1, name: 'First checking', status: 'PENDING' },
        { id: 2, name: 'Basic Buttons checking', status: 'PENDING' },
        { id: 3, name: 'Light / Rumble / Trigger checking', status: 'PENDING' },
        { id: 4, name: 'Mic/audio checking', status: 'PENDING' },
        { id: 5, name: 'Bluetooth checking', status: 'PENDING' }
      ],
      globalStatus: 'IN_PROGRESS',
      deviceSerialNumber,
      isActive: true
    }
    currentStepIndex.value = 0
  }

  const checkAndStartNewSession = (deviceSerialNumber: string) => {
    if (!currentSession.value || currentSession.value.deviceSerialNumber !== deviceSerialNumber) {
      startNewSession(deviceSerialNumber)
    }
  }

  const goToNextStep = () => {
    if (currentSession.value?.isActive && currentStepIndex.value < currentSession.value.steps.length - 1) {
      currentStepIndex.value += 1
    }
  }

  const setStepSuccess = () => {
    if (!currentSession.value?.isActive) return

    currentSession.value.steps[currentStepIndex.value].status = 'SUCCESS'
    saveProgressToDatabase(currentSession.value)
    if (currentStepIndex.value < currentSession.value.steps.length - 1) {
      goToNextStep()
    } else {
      endSession()
    }
  }

  const setStepFail = () => {
    if (!currentSession.value?.isActive) return

    currentSession.value.steps[currentStepIndex.value].status = 'FAIL'
    endSession()
  }

  const endSession = () => {
    if (!currentSession.value) return
    currentSession.value.globalStatus = currentSession.value.steps.some(step => step.status === 'FAIL') ? 'KO' : 'OK'
    currentSession.value.duration = Date.now() - currentSession.value.startDate.getTime()
    currentSession.value.isActive = false
    saveProgressToDatabase(currentSession.value)
  }

  const saveProgressToDatabase = async (session: Session) => {
    console.log(`Saving session:`, session)
    // Implement the actual API call here
  }

  return {
    currentSession,
    currentStep,
    startNewSession,
    checkAndStartNewSession,
    setStepSuccess,
    setStepFail,
    goToNextStep,
    endSession,
  }
})
