
import { computed, ref } from 'vue'
import {
  getSession,
  logoutFromFrappe,
  type FrappeSession,
} from '../services/session'

type SessionStatus =
  | 'unknown'
  | 'checking'
  | 'authenticated'
  | 'guest'
  | 'error'

// Module-level state means every component shares the same session.
const status = ref<SessionStatus>('unknown')
const user = ref<string | null>(null)
const error = ref<string | null>(null)

let sessionRequest: Promise<void> | null = null

function applySession(session: FrappeSession) {
  user.value = session.authenticated ? session.user : null
  status.value = session.authenticated ? 'authenticated' : 'guest'
}

async function checkSession(force = false): Promise<void> {
  if (sessionRequest && !force) {
    return sessionRequest
  }

  if (
    !force &&
    (status.value === 'authenticated' || status.value === 'guest')
  ) {
    return
  }

  status.value = 'checking'
  error.value = null

  sessionRequest = (async () => {
    try {
      applySession(await getSession())
    } catch {
      status.value = 'error'
      user.value = null
      error.value = 'Unable to verify your session. Please try again.'
    } finally {
      sessionRequest = null
    }
  })()

  return sessionRequest
}

async function logout(): Promise<void> {
  error.value = null

  try {
    await logoutFromFrappe()

    user.value = null
    status.value = 'guest'

    // Redirect to login page as per the original implementation
    window.location.assign('/login.html')
  } catch (err) {
    console.error('Frappe logout request failed:', err)

    error.value =
      err instanceof Error
        ? err.message
        : 'Unable to log out. Please try again.'
  }
}

export function useSession() {
  return {
    status,
    user,
    error,
    isAuthenticated: computed(() => status.value === 'authenticated'),
    isChecking: computed(() => status.value === 'checking'),
    checkSession,
    logout,
    logoutFromFrappe,
  }
}
