<template>
  <div class="reset-container">
  <div class="glass card">
      <h2>Restablecer Contraseña</h2>
      <form @submit.prevent="reset">
        <input v-model="email" placeholder="Email" type="email" required class="input" />
        <input v-model="token" placeholder="Token" required class="input" />
        <input v-model="password" placeholder="Nueva contraseña" type="password" required class="input" />
        <button class="btn" type="submit">Restablecer</button>
      </form>
      <router-link to="/login">Volver a login</router-link>
      <div v-if="msg" class="msg">{{ msg }}</div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
gsap = require('gsap');

const email = ref('');
const token = ref('');
const password = ref('');
const msg = ref('');
const error = ref('');
const router = useRouter();

onMounted(() => {
  gsap.to('.glass', { boxShadow: '0 0 40px #2d8cf0', duration: 2, repeat: -1, yoyo: true });
});

const reset = async () => {
  msg.value = '';
  error.value = '';
  try {
    const res = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, token: token.value, password: password.value })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg);
    msg.value = 'Contraseña actualizada, inicia sesión.';
  } catch (e) {
    error.value = e.message;
  }
};
</script>

<style scoped>
.reset-container { display:flex; justify-content:center; align-items:center; min-height:100vh }
.input {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.btn {
  margin: 8px 0;
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: #2d8cf0;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.btn:hover {
  background: #1a73e8;
}
.error { color: red; margin-top: 10px; }
.msg { color: green; margin-top: 10px; }
</style>
