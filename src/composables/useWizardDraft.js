import { watch, onBeforeUnmount } from 'vue'
import { fetchDraft as fetchRemoteDraft, saveDraftRemote, deleteDraftRemote } from '@/services/draftService.js'

function safeClone(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return null
  }
}

function hasMeaningfulValue(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'boolean') return value === true
  if (Array.isArray(value)) return value.some(hasMeaningfulValue)
  if (typeof value === 'object') return Object.values(value).some(hasMeaningfulValue)
  return true
}

function isFormEmpty(value) {
  if (!value || typeof value !== 'object') return true
  return !Object.values(value).some(hasMeaningfulValue)
}

function assignDraft(target, data) {
  if (!target || !data || typeof data !== 'object') return
  const dest = (target && typeof target === 'object' && Object.prototype.hasOwnProperty.call(target, 'value')) ? target.value : target
  Object.keys(data).forEach((key) => {
    const val = data[key]
    if (Array.isArray(val)) {
      dest[key] = val.map(item => (item && typeof item === 'object' ? { ...item } : item))
      return
    }
    if (val && typeof val === 'object') {
      dest[key] = { ...val }
      return
    }
    dest[key] = val
  })
}

function stripDraftBinaryData(value) {
  if (Array.isArray(value)) return value.map(stripDraftBinaryData)
  if (!value || typeof value !== 'object') return value

  const out = {}
  Object.keys(value).forEach((key) => {
    const val = value[key]
    if (val && typeof val === 'object' && typeof val.dataUrl === 'string') {
      const clone = { ...val }
      delete clone.dataUrl
      out[key] = stripDraftBinaryData(clone)
      return
    }
    if (typeof val === 'string' && val.startsWith('data:') && val.length > 2000) {
      out[key] = null
      return
    }
    out[key] = stripDraftBinaryData(val)
  })
  return out
}

function coerceTimestamp(value) {
  if (!value) return 0
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const num = Number(value)
  if (Number.isFinite(num)) return num
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function useWizardDraft(options = {}) {
  const {
    key = '',
    form = null,
    stepRef = null,
    enabled = true,
    extra = null,
    applyExtra = null,
    extraSources = []
  } = options

  const storageKey = `wizardDraft:${key}`
  
  let suppressSave = false
  // Flag que indica que estamos aplicando/rehidratando un draft
  let isRestoring = false
  let restoreTimer = null
  const RESTORE_SUPPRESS_MS = 800

  const remoteConfig = {
    enabled: options.remote !== false,
    key: String(options.remoteKey || key || '').trim(),
    debounceMs: typeof options.remoteDebounceMs === 'number' ? options.remoteDebounceMs : 1500,
    minIntervalMs: typeof options.remoteMinIntervalMs === 'number' ? options.remoteMinIntervalMs : 1200,
    maxPayloadBytes: typeof options.remoteMaxPayloadBytes === 'number' ? options.remoteMaxPayloadBytes : 900000
  }

  let remoteTimer = null
  let remoteInFlight = false
  let remoteQueuedPayload = null
  let remoteVersion = null
  let remoteHydrating = false
  let remoteHydrated = false
  let lastRemotePayloadHash = ''
  let lastRemoteSaveAt = 0
  let lastAppliedAt = 0
  // Timer que limpia la supresión tras aplicar un draft
  let restoreSuppressTimer = null

  const isEnabled = () => (typeof enabled === 'function' ? enabled() : !!enabled)
  const isRemoteEnabled = () => remoteConfig.enabled && isEnabled() && !!remoteConfig.key

  const getFormObject = (f) => ((f && typeof f === 'object' && Object.prototype.hasOwnProperty.call(f, 'value')) ? f.value : f)

  const buildPayload = () => {
    const formObj = getFormObject(form)
    if (!isEnabled() || !key || !formObj) return null
    const payload = {
      updatedAt: Date.now(),
      form: safeClone(formObj),
      step: stepRef && typeof stepRef.value === 'number' ? stepRef.value : 0,
      extra: typeof extra === 'function' ? safeClone(extra()) : null
    }
    if (!payload.form) return null
    return payload
  }

  async function pushRemoteDraft(payload, options = {}) {
    if (!isRemoteEnabled() || !payload) return

    const now = Date.now()
    if (!options.force && now - lastRemoteSaveAt < remoteConfig.minIntervalMs) {
      scheduleRemoteSave(payload, { force: true })
      return
    }

    const trimmedPayload = stripDraftBinaryData(payload)
    let payloadString = ''
    try {
      payloadString = JSON.stringify(trimmedPayload)
    } catch {
      return
    }

    if (!options.force && payloadString === lastRemotePayloadHash) return
    if (payloadString.length > remoteConfig.maxPayloadBytes) {
      console.warn('[useWizardDraft] remote draft too large, skipping', {
        key: remoteConfig.key,
        size: payloadString.length
      })
      return
    }

    if (remoteInFlight) {
      remoteQueuedPayload = payload
      return
    }

    remoteInFlight = true
    try {
      const result = await saveDraftRemote(remoteConfig.key, trimmedPayload, {
        clientUpdatedAt: payload.updatedAt,
        version: remoteVersion
      })
      const { res, data } = result || {}
      if (res && res.ok && data) {
        if (typeof data.version === 'number') remoteVersion = data.version
        lastRemoteSaveAt = Date.now()
        lastRemotePayloadHash = payloadString
      } else if (res && res.status === 409 && data && data.draft) {
        if (typeof data.draft.version === 'number') remoteVersion = data.draft.version
      }
    } catch {
      // ignore remote errors
    } finally {
      remoteInFlight = false
      if (remoteQueuedPayload) {
        const nextPayload = remoteQueuedPayload
        remoteQueuedPayload = null
        scheduleRemoteSave(nextPayload, { force: true })
      }
    }
  }

  function scheduleRemoteSave(payload, options = {}) {
    if (!isRemoteEnabled() || !payload) return
    if (remoteTimer) clearTimeout(remoteTimer)
    const delay = options.force ? 0 : remoteConfig.debounceMs
    remoteTimer = setTimeout(() => {
      pushRemoteDraft(payload, options)
    }, delay)
  }

  const flushRemoteDraft = () => {
    const payload = buildPayload()
    if (!payload) return null
    return pushRemoteDraft(payload, { force: true })
  }

  async function hydrateRemoteDraft() {
    if (!isRemoteEnabled() || remoteHydrating || remoteHydrated) return
    remoteHydrating = true
    try {
      const result = await fetchRemoteDraft(remoteConfig.key)
      const { res, data } = result || {}
      if (!res || !res.ok || !data || !data.draft) return
      const remoteDraft = data.draft
      if (typeof remoteDraft.version === 'number') remoteVersion = remoteDraft.version

      if (remoteDraft.payload) {
        let localDraft = null
        try {
          const raw = localStorage.getItem(storageKey)
          localDraft = raw ? JSON.parse(raw) : null
        } catch {
          localDraft = null
        }

        const localUpdatedAt = coerceTimestamp(localDraft && localDraft.updatedAt)
        const remoteUpdatedAt = coerceTimestamp(remoteDraft.clientUpdatedAt || (remoteDraft.payload && remoteDraft.payload.updatedAt) || remoteDraft.serverUpdatedAt)

        if (!localDraft || remoteUpdatedAt > localUpdatedAt) {
            try {
              localStorage.setItem(storageKey, JSON.stringify(remoteDraft.payload))
              try { sessionStorage.setItem(storageKey + ':needsRestore', String(Date.now())) } catch {}
              try { window.dispatchEvent(new Event('restore:applyDrafts')) } catch {}
            } catch {
              // ignore storage errors
            }
        } else if (localDraft && localUpdatedAt > remoteUpdatedAt) {
          scheduleRemoteSave(localDraft, { force: true })
        }
      }
    } catch {
      // ignore hydration errors
    } finally {
      remoteHydrating = false
      remoteHydrated = true
    }
  }

  const saveDraft = () => {
    if (!isEnabled() || !key || !form) return
    if (suppressSave || isRestoring) {
      console.log('[Wizard] Skipping save (restoring)...', storageKey)
      return
    }
    try {
      // Evitar sobrescribir inmediatamente después de aplicar un draft restaurado
      try {
        const now = Date.now()
        if (typeof lastAppliedAt === 'number' && lastAppliedAt && (now - lastAppliedAt) < 1200) {
          console.log('[Wizard] Skipping save (just applied)...', storageKey)
          return
        }
      } catch (e) { /* ignore timing guard errors */ }
      let existing = null
      try {
        const raw = localStorage.getItem(storageKey)
        existing = raw ? JSON.parse(raw) : null
      } catch {}
      const formObj = getFormObject(form)
      // No guardar formularios vacíos: proteccion fuerte para evitar payloads vacíos
      try {
        if (isFormEmpty(formObj)) {
          console.log('[Wizard] Skip save: empty form', storageKey)
          return
        }
      } catch (e) { /* ignore */ }
      if (existing && existing.form && isFormEmpty(formObj) && !isFormEmpty(existing.form)) {
        return
      }
      const payload = buildPayload()
      if (!payload) return
      // Guardar una copia profunda para evitar referencias compartidas
      let cloned = null
      try {
        cloned = JSON.parse(JSON.stringify(payload))
      } catch {
        cloned = payload
      }
      const payloadString = JSON.stringify(cloned)
      localStorage.setItem(storageKey, payloadString)
      try {
        sessionStorage.setItem(storageKey, payloadString)
        try { sessionStorage.setItem(storageKey + ':needsRestore', String(Date.now())) } catch {}
      } catch {}
      // Mantener payload original para envío remoto (scheduling)
      scheduleRemoteSave(payload)
    } catch {
      // ignore
    }
  }

  // Registrar un handler global para forzar guardado en caso de carrera (logout rápido)
  try {
    if (typeof window !== 'undefined') {
      window.__wizardDraftSaveHandlers = window.__wizardDraftSaveHandlers || {}
      window.__wizardDraftSaveHandlers[storageKey] = saveDraft
      window.__wizardDraftSyncHandlers = window.__wizardDraftSyncHandlers || {}
      window.__wizardDraftSyncHandlers[storageKey] = flushRemoteDraft
    }
  } catch {}

  try {
    onBeforeUnmount(() => {
      try {
        if (typeof window !== 'undefined' && window.__wizardDraftSaveHandlers && window.__wizardDraftSaveHandlers[storageKey]) {
          delete window.__wizardDraftSaveHandlers[storageKey]
        }
        if (typeof window !== 'undefined' && window.__wizardDraftSyncHandlers && window.__wizardDraftSyncHandlers[storageKey]) {
          delete window.__wizardDraftSyncHandlers[storageKey]
        }
        if (typeof window !== 'undefined' && window.__wizardDraftDiscardHandlers && window.__wizardDraftDiscardHandlers[storageKey]) {
          window.removeEventListener('wizard:draft:discard', window.__wizardDraftDiscardHandlers[storageKey])
          delete window.__wizardDraftDiscardHandlers[storageKey]
        }
      } catch {}
      if (remoteTimer) clearTimeout(remoteTimer)
      try { if (restoreSuppressTimer) { clearTimeout(restoreSuppressTimer); restoreSuppressTimer = null } } catch {}
      suppressSave = false
      isRestoring = false
    })
  } catch {}

  const loadDraft = () => {
    if (!key) return null
    try {
      const raw = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  const applyDraft = (payload) => {
    if (!payload || !form) return false
    try {
      console.log('[Wizard] Restoring draft...', storageKey)
      // Marcar que estamos restaurando y suprimir guardados automáticos
      isRestoring = true
      suppressSave = true
      if (payload.form) assignDraft(form, payload.form)
      if (stepRef && typeof payload.step === 'number') stepRef.value = payload.step
      if (payload.extra && typeof applyExtra === 'function') applyExtra(payload.extra)
      try { sessionStorage.removeItem(storageKey + ':needsRestore') } catch {}
      // Asegurar presencia en localStorage
      try { localStorage.setItem(storageKey, JSON.stringify(payload)) } catch {}
      lastAppliedAt = Date.now()
      try { if (restoreSuppressTimer) clearTimeout(restoreSuppressTimer) } catch {}
      restoreSuppressTimer = setTimeout(() => {
        suppressSave = false
        isRestoring = false
        restoreSuppressTimer = null
      }, RESTORE_SUPPRESS_MS)
    } catch (e) {
      console.warn('[useWizardDraft] applyDraft failed', e)
    }
    return true
  }

  const clearDraft = () => {
    try { localStorage.removeItem(storageKey) } catch {}
    try { sessionStorage.removeItem(storageKey) } catch {}
    try { sessionStorage.removeItem(storageKey + ':needsRestore') } catch {}
    try {
      if (isRemoteEnabled()) {
        deleteDraftRemote(remoteConfig.key)
      }
    } catch {}
    remoteVersion = null
  }

  try {
    hydrateRemoteDraft()
  } catch {}

  try {
    const handleDiscardEvent = (event) => {
      try {
        const detail = event.detail || {}
        if (detail.key === key) {
          suppressSave = true
        }
      } catch {}
    }
    window.addEventListener('wizard:draft:discard', handleDiscardEvent)
    window.__wizardDraftDiscardHandlers = window.__wizardDraftDiscardHandlers || {}
    window.__wizardDraftDiscardHandlers[storageKey] = handleDiscardEvent
  } catch {}

  if (form) watch(form, saveDraft, { deep: true })
  if (stepRef) watch(stepRef, saveDraft)
  if (Array.isArray(extraSources) && extraSources.length) {
    extraSources.forEach((src) => {
      try { watch(src, saveDraft, { deep: true }) } catch {}
    })
  }

  return {
    storageKey,
    saveDraft,
    loadDraft,
    applyDraft,
    clearDraft,
    // Estado consultable: si estamos en proceso de restauración
    isRestoring: () => isRestoring
  }
}
