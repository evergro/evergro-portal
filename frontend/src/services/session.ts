
import { api } from './api'

export interface FrappeSession {
  user: string
  authenticated: boolean
}

export async function getSession(): Promise<FrappeSession> {
  const user = await api<string>('frappe.auth.get_logged_user')

  return {
    user,
    authenticated: user !== 'Guest',
  }
}

export async function logoutFromFrappe(): Promise<void> {
  await api<unknown>('logout', { method: 'POST' })
}