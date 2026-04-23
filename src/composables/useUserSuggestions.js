import { ref } from 'vue'
import { authedFetch } from '@/utils/api.js'

export function useUserSuggestions() {
    const users = ref([])
    const isLoading = ref(false)

    async function fetchUsers() {
        if (users.value.length > 0) return
        isLoading.value = true
        try {
            const res = await authedFetch('/api/auth/users')
            if (res.ok) {
                users.value = await res.json()
            }
        } catch (err) {
            console.error('[useUserSuggestions] Error fetching users:', err)
        } finally {
            isLoading.value = false
        }
    }

    function getSuggestionsForRole(role) {
        const r = String(role || '').toLowerCase().trim()
        return users.value.filter(u => String(u.role).toLowerCase() === r || String(u.role).toLowerCase() === 'admin')
    }

    return {
        users,
        isLoading,
        fetchUsers,
        getSuggestionsForRole
    }
}
