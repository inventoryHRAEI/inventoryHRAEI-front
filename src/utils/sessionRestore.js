import { fetchDrafts, clearDraftsRemote } from '@/services/draftService.js'

const SESSION_KEY = 'sessionStateBeforeLogout'
const WIZARD_KEY = 'sessionWizardState'
const PANEL_KEY = 'sessionFloatingPanelState'
const DRAFT_KEYS = [
  'wizardDraft:entrada',
  'wizardDraft:salida',
  'wizardDraft:resguardo',
  'wizardDraft:servicio'
]

const DRAFT_ROUTE_MAP = {
  entrada: 'order-management',
  salida: 'order-management-salida',
  resguardo: 'order-management-resguardo',
  servicio: 'order-management-servicio'
}

function getFullPath() {
  try {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`
  } catch {
    return ''
  }
}

function writeState(key, state) {
  try {
    const payload = JSON.stringify(state)
    localStorage.setItem(key, payload)
    sessionStorage.setItem(key, payload)
  } catch {
    try { sessionStorage.setItem(key, JSON.stringify(state)) } catch {}
  }
}

function readState(key) {
  try {
    const rawLocal = localStorage.getItem(key)
    if (rawLocal) return JSON.parse(rawLocal)
  } catch {}
  try {
    const rawSession = sessionStorage.getItem(key)
    if (rawSession) return JSON.parse(rawSession)
  } catch {}
  return null
}

function removeState(key) {
  try { localStorage.removeItem(key) } catch {}
  try { sessionStorage.removeItem(key) } catch {}
}

export function saveSessionState(reason = 'manual', extra = {}) {
  try {
    const state = {
      timestamp: Date.now(),
      reason,
      fullPath: getFullPath(),
      route: window.location.pathname,
      query: window.location.search,
      hash: window.location.hash,
      scrollPosition: { x: window.scrollX, y: window.scrollY },
      ...extra
    }
    writeState(SESSION_KEY, state)
    return state
  } catch {
    return null
  }
}

export function peekSessionState() {
  return readState(SESSION_KEY)
}

export function clearSessionState() {
  removeState(SESSION_KEY)
}

export function saveWizardState(state) {
  if (!state) return
  try {
    writeState(WIZARD_KEY, { ...state, updatedAt: Date.now() })
  } catch {}
}

export function peekWizardState() {
  return readState(WIZARD_KEY)
}

export function clearWizardState() {
  removeState(WIZARD_KEY)
}

export function clearWizardDraft(key) {
  try {
    const draftKey = String(key || '').trim()
    if (!draftKey) return
    const storageKey = `wizardDraft:${draftKey}`
    try { localStorage.removeItem(storageKey) } catch {}
    try { sessionStorage.removeItem(storageKey) } catch {}
    try { sessionStorage.removeItem(storageKey + ':needsRestore') } catch {}
    try { window.dispatchEvent(new CustomEvent('wizard:draft:discard', { detail: { key: draftKey } })) } catch {}
  } catch {}
}

export function savePanelState(state) {
  if (!state) return
  try {
    writeState(PANEL_KEY, { ...state, updatedAt: Date.now() })
  } catch {}
}

export function peekPanelState() {
  return readState(PANEL_KEY)
}

export function clearPanelState() {
  removeState(PANEL_KEY)
}

export function hasWizardDrafts() {
  try {
    return DRAFT_KEYS.some((key) => {
      const rawLocal = localStorage.getItem(key)
      if (rawLocal) return true
      const rawSession = sessionStorage.getItem(key)
      return !!rawSession
    })
  } catch {
    return false
  }
}

export function peekDraftRoute() {
  try {
    const draftSummaries = DRAFT_KEYS.map((storageKey) => {
      try {
        const raw = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey)
        if (!raw) return null
        const parsed = JSON.parse(raw)
        return {
          key: String(storageKey).replace('wizardDraft:', ''),
          updatedAt: Number(parsed?.updatedAt || 0)
        }
      } catch {
        return null
      }
    }).filter(Boolean)

    if (!draftSummaries.length) return null
    draftSummaries.sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
    const best = draftSummaries[0]
    if (!best || !best.key) return null
    const routeName = DRAFT_ROUTE_MAP[best.key]
    return routeName ? { routeName, key: best.key, updatedAt: best.updatedAt } : null
  } catch {
    return null
  }
}

export function clearWizardDrafts() {
  try {
    DRAFT_KEYS.forEach((key) => {
      try { localStorage.removeItem(key) } catch {}
      try { sessionStorage.removeItem(key) } catch {}
      try { sessionStorage.removeItem(key + ':needsRestore') } catch {}
      try {
        const backupKey = key.replace('wizardDraft:', 'wizardDraftBackup:')
        try { localStorage.removeItem(backupKey) } catch {}
        try { sessionStorage.removeItem(backupKey) } catch {}
      } catch {}
    })
  } catch {}
}

export async function syncRemoteDraftsToLocal() {
  try {
    const keys = DRAFT_KEYS.map(key => key.replace('wizardDraft:', ''))
    const result = await fetchDrafts({ keys, includePayload: true })
    const { res, data } = result || {}
    if (!res || !res.ok || !data || !Array.isArray(data.drafts)) {
      return { ok: false, count: 0 }
    }

    let count = 0
    data.drafts.forEach((draft) => {
      if (!draft || !draft.key || !draft.payload) return
      const storageKey = `wizardDraft:${draft.key}`
      let localUpdatedAt = 0
      try {
        const raw = localStorage.getItem(storageKey)
        const parsed = raw ? JSON.parse(raw) : null
        localUpdatedAt = Number(parsed && parsed.updatedAt ? parsed.updatedAt : 0)
      } catch {}

      const remoteUpdatedAt = Number(draft.clientUpdatedAt || (draft.payload && draft.payload.updatedAt) || 0)
      if (!localUpdatedAt || remoteUpdatedAt > localUpdatedAt) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(draft.payload))
          try { sessionStorage.setItem(storageKey + ':needsRestore', String(Date.now())) } catch {}
          count += 1
        } catch {}
      }
    })

    return { ok: true, count }
  } catch {
    return { ok: false, count: 0 }
  }
}

export async function clearRemoteWizardDrafts() {
  try {
    await clearDraftsRemote()
  } catch {}
}

// Helper: determine if a form object has any meaningful value
function hasMeaningfulValue(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'boolean') return value === true
  if (Array.isArray(value)) return value.some(hasMeaningfulValue)
  if (typeof value === 'object') return Object.values(value).some(hasMeaningfulValue)
  return true
}

function isFormEmpty(form) {
  if (!form || typeof form !== 'object') return true
  return !Object.values(form).some(hasMeaningfulValue)
}

export function backupWizardDrafts() {
  try {
    DRAFT_KEYS.forEach((key) => {
      try {
        const raw = localStorage.getItem(key) || sessionStorage.getItem(key)
        if (!raw) return
        const parsed = raw ? JSON.parse(raw) : null
        if (!parsed || !parsed.form) return
        if (!isFormEmpty(parsed.form)) {
          const backupKey = key.replace('wizardDraft:', 'wizardDraftBackup:')
          try { localStorage.setItem(backupKey, JSON.stringify(parsed)) } catch {}
        }
      } catch {}
    })
  } catch {}
}

export function promoteBackupsIfNeeded() {
  try {
    DRAFT_KEYS.forEach((key) => {
      try {
        const mainRaw = localStorage.getItem(key) || sessionStorage.getItem(key)
        const backupKey = key.replace('wizardDraft:', 'wizardDraftBackup:')
        const backupRaw = localStorage.getItem(backupKey) || sessionStorage.getItem(backupKey)
        const mainParsed = mainRaw ? JSON.parse(mainRaw) : null
        const backupParsed = backupRaw ? JSON.parse(backupRaw) : null

        const mainEmpty = !mainParsed || !mainParsed.form || isFormEmpty(mainParsed.form)
        const backupHas = backupParsed && backupParsed.form && !isFormEmpty(backupParsed.form)

        if (mainEmpty && backupHas) {
          try {
            localStorage.setItem(key, JSON.stringify(backupParsed))
            try { sessionStorage.setItem(key + ':needsRestore', String(Date.now())) } catch {}
          } catch {}
          return
        }

        if (mainParsed && backupHas) {
          const mainAt = Number(mainParsed.updatedAt || 0)
          const backupAt = Number(backupParsed.updatedAt || 0)
          if (backupAt > mainAt) {
            try {
              localStorage.setItem(key, JSON.stringify(backupParsed))
              try { sessionStorage.setItem(key + ':needsRestore', String(Date.now())) } catch {}
            } catch {}
          }
        }
      } catch {}
    })
  } catch {}
}
