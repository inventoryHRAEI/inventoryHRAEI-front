import { ref, computed } from 'vue'
import { authedFetch } from '@/utils/api'
import notifier from '@/utils/notifier'

export function useEditRequest() {
  const editRequestStatus = ref(null) // null, 'pending', 'approved', 'rejected', 'consumed'
  const loading = ref(false)

  const isEditAllowed = computed(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const role = String(user.rol || user.role || '').toLowerCase()
    if (role === 'admin' || role === 'superadmin') return true
    return editRequestStatus.value === 'approved'
  })

  const checkEditPermission = async (operationType, operationId) => {
    if (!operationId) return
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const role = String(user.rol || user.role || '').toLowerCase()
    if (role === 'admin' || role === 'superadmin') return

    try {
      const response = await authedFetch(`/api/edit-requests`)
      if (response.ok) {
        const data = await response.json()
        const match = data.find(req => req.operation_type === operationType && req.operation_id == operationId && ['pending', 'approved'].includes(req.status))
        if (match) {
          editRequestStatus.value = match.status
        } else {
          editRequestStatus.value = null
        }
      }
    } catch (err) {
      console.error('Error al revisar permisos de edición:', err)
    }
  }

  const requestEditPermission = async (operationType, operationId) => {
    loading.value = true
    try {
      const response = await authedFetch(`/api/edit-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation_type: operationType, operation_id: operationId })
      })

      if (response.ok) {
        notifier.success('Permiso solicitado correctamente')
        editRequestStatus.value = 'pending'
      } else {
        const err = await response.json()
        notifier.error(err.error || 'Error al solicitar permiso')
      }
    } catch (err) {
      notifier.error('Error de red al solicitar permiso')
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return {
    editRequestStatus,
    loadingEditRequest: loading,
    isEditAllowed,
    checkEditPermission,
    requestEditPermission
  }
}
