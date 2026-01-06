<template>
  <div class="inventory-table">
    <div class="table-actions">
      <div class="searches">
        <input v-model="filters.search" placeholder="Buscar (No., equipo, marca, modelo, área)" />
        <select v-model="filters.status">
          <option value="">Todos los estados</option>
          <option value="DISPONIBLE">DISPONIBLE</option>
          <option value="EN MANTENIMIENTO">EN MANTENIMIENTO</option>
          <option value="OPERATIVO">OPERATIVO</option>
        </select>
        <button class="btn" @click="clearFilters" title="Limpiar">Limpiar</button>
      </div>
      <div class="counts">
        <small>Mostrando: {{ filtered.length }} / {{ props.items.length }}</small>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>No. Inventario</th>
          <th>Equipo médico</th>
          <th>Marca</th>
          <th>Modelo</th>
          <th>Área</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filtered" :key="item.inventoryNo">
          <td>{{ item.inventoryNo }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.brand }}</td>
          <td>{{ item.model }}</td>
          <td>{{ item.area }}</td>
          <td><span :class="['badge', stateClass(item.status)]">{{ item.status }}</span></td>
          <td class="actions-cell">
            <div class="action-buttons">
              <button v-if="item.status !== 'EN MANTENIMIENTO'" class="btn small start" @click.stop="$emit('start', item)" title="Iniciar mantenimiento">Iniciar</button>
              <button v-else class="btn small finish" @click.stop="$emit('finish', item)" title="Finalizar mantenimiento">Finalizar</button>
              <button class="btn small" @click.stop="$emit('view', item)" title="Ver detalle">Ver</button>
            </div>
          </td>
        </tr>
        <tr v-if="filtered.length === 0">
          <td colspan="7" class="empty">No se encontraron equipos</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({ items: { type: Array, default: () => [] } })
const emit = defineEmits(['view','start','finish'])

const filters = reactive({ search: '', status: '' })

const filtered = computed(() => {
  return props.items.filter(it => {
    // status filter
    if (filters.status && it.status !== filters.status) return false

    // global search across several fields
    const s = String(filters.search || '').toLowerCase().trim()
    if (!s) return true

    const inv = String(it.inventoryNo || '').toLowerCase()
    const name = String(it.name || '').toLowerCase()
    const brand = String(it.brand || '').toLowerCase()
    const model = String(it.model || '').toLowerCase()
    const area = String(it.area || '').toLowerCase()

    return inv.includes(s) || name.includes(s) || brand.includes(s) || model.includes(s) || area.includes(s)
  })
})

function clearFilters() {
  filters.search = ''
  filters.status = ''
}

function stateClass(s) {
  if (!s) return ''
  if (s === 'DISPONIBLE') return 'is-green'
  if (s === 'EN MANTENIMIENTO') return 'is-yellow'
  if (s === 'OPERATIVO') return 'is-blue'
  return ''
}
</script>

<style scoped>
.inventory-table { background: #fff; padding: 12px; border-radius: 8px }
.table-actions { display:flex; justify-content:space-between; margin-bottom:8px }
.searches input { margin-right:8px; padding:6px 8px; border-radius:6px; border:1px solid #ddd }
table { width:100%; border-collapse: collapse }
thead th { text-align:left; padding:8px 6px; font-weight:700; color:#234 }
tbody td { padding:8px 6px; border-top:1px solid #f2f2f2 }
.badge { padding:4px 8px; border-radius:999px; color:#fff; font-weight:700; font-size:0.85rem }
.badge.is-green { background:#10b981 }
.badge.is-yellow { background:#f59e0b }
.badge.is-blue { background:#3b82f6 }
.btn.small { padding:6px 10px; border-radius:8px; background:#f3f4f6; border:none }
.empty { text-align:center; padding:20px; color:#666 }

.action-buttons { display:flex; gap:8px; align-items:center }
.actions-cell { white-space:nowrap }
.btn.start { background:#10b981; color:#fff; border:none }
.btn.finish { background:#f59e0b; color:#fff; border:none }
.btn.small{ padding:6px 10px; border-radius:8px; background:#f3f4f6; border:none }
.table-actions .searches input, .table-actions .searches select { padding:6px 8px; border-radius:6px; border:1px solid #ddd; margin-right:8px }
.table-actions .searches .btn { background:#f8fafc }
.table-actions .counts { display:flex; align-items:center; color:#666 }
</style>