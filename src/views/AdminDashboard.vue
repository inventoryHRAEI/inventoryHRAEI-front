<template>
  <ActionPanel>
    <template #title>Administrador — Gestión</template>

    <div class="grid-cards reactive-panel">
      <button class="card-button">EQUIPO MEDICO I.P</button>
      <button class="card-button">EQUIPOS DE ADQUISICIÓN</button>
      <button class="card-button">COMODATOS</button>
      <button class="card-button">MOBILIARIO CLÍNICO/MÉDICO</button>
      <button class="card-button">DONACIÓN</button>
      <button class="card-button">MICROPIPETAS Y PIPETAS</button>
    </div>

    <section v-if="showUsers" class="glass-panel list-panel">
      <h3>Usuarios</h3>
      <table class="users-table">
        <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Verificado</th></tr></thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.nombre }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.role }}</td>
            <td>{{ u.verificado ? 'Sí' : 'No' }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </ActionPanel>
</template>

<script setup>
import ActionPanel from '@/components/ActionPanel.vue'
import { ref, onMounted } from 'vue'

const showUsers = ref(false)
const users = ref([])

onMounted(async () => {
  try {
    const res = await fetch('/api/auth/users')
    users.value = await res.json()
  } catch (e) {
    console.error('No se pudieron obtener usuarios:', e)
  }
})
</script>

<style scoped>
.grid-cards{ display:grid; grid-template-columns: repeat(3,1fr); gap:16px; margin-top:14px }
.card-button{ padding:16px; border-radius:12px; border:1px solid rgba(0,0,0,0.06); background: rgba(255,255,255,0.86); cursor:pointer; font-weight:800; box-shadow:0 10px 20px rgba(2,6,23,0.1) }
.card-button:hover{ box-shadow:0 14px 30px rgba(2,6,23,0.12) }
.glass-panel{ margin-top:16px; padding:12px; border-radius:12px; background: rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.22); backdrop-filter: blur(8px) }
.users-table{ width:100%; border-collapse:collapse; margin-top:12px }
.users-table th,.users-table td{ border:1px solid rgba(0,0,0,0.08); padding:8px; background: rgba(255,255,255,0.8) }

@media (max-width: 960px){ .grid-cards{ grid-template-columns: repeat(2,1fr) } }
@media (max-width: 560px){ .grid-cards{ grid-template-columns: 1fr } }
</style>