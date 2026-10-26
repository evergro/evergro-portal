
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface FrappeResponse<T> {
  message?: T
  exc?: string
  exc_type?: string
  _server_messages?: string
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  query?: Record<string, string | number | boolean>
  body?: Record<string, unknown>
}

interface FrappeGlobals {
  csrf_token?: string
}

declare global {
  interface Window {
    frappe?: FrappeGlobals
    csrf_token?: string
  }
}


function getCsrfToken(): string {
  const token =
    window.frappe?.csrf_token ??
    window.csrf_token

  if (!token) {
    throw new Error(
      'CSRF token unavailable. Ensure the frontend is using an authenticated Frappe session.',
    )
  }

  return token
}

export async function api<T>(
  methodPath: string,
  options: RequestOptions = {},
): Promise<T> {
  const httpMethod = options.method ?? 'GET'

  // Only allow Frappe method paths, not arbitrary URLs.
  if (
    !/^[a-zA-Z0-9_.]+$/.test(methodPath) ||
    methodPath.startsWith('.') ||
    methodPath.endsWith('.')
  ) {
    throw new ApiError('Invalid API method path.')
  }

  const url = new URL(
    `/api/method/${methodPath}`,
    window.location.origin,
  )

  for (const [key, value] of Object.entries(options.query ?? {})) {
    url.searchParams.set(key, String(value))
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (httpMethod !== 'GET') {
    headers['X-Frappe-CSRF-Token'] = await getCsrfToken()
  }

  let response: Response

  try {
    response = await fetch(url, {
      method: httpMethod,
      credentials: 'same-origin',
      headers,
      ...(options.body !== undefined
        ? { body: JSON.stringify(options.body) }
        : {}),
    })
  } catch {
    throw new ApiError(
      'Unable to connect to the server. Check your connection and try again.',
    )
  }

  const data = (await response.json().catch(() => null)) as
    | FrappeResponse<T>
    | null

  if (!response.ok) {
    throw new ApiError(
      `The request failed (${response.status}).`,
      response.status,
    )
  }

  if (!data || data.exc || data.exc_type || !('message' in data)) {
    throw new ApiError(
      'The server could not complete the request.',
      response.status,
      data?.exc_type,
    )
  }

  return data.message as T
}
