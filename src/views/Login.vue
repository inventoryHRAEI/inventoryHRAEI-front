<template>
  <div class="login-container">
  <div class="glass card">
      <h2>Iniciar Sesión</h2>
      <form @submit.prevent="login">
        <input v-model="email" placeholder="Email" type="email" required class="input" />
        <input v-model="password" placeholder="Contraseña" type="password" required class="input" />
        <button class="btn" type="submit">Entrar</button>
      </form>
      <router-link to="/forgot">¿Olvidaste tu contraseña?</router-link>
      <router-link to="/register">Registrarse</router-link>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import gsap from 'gsap';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

onMounted(() => {
  gsap.to('.glass', { boxShadow: '0 0 40px #2d8cf0', duration: 2, repeat: -1, yoyo: true });
});

const login = async () => {
  error.value = '';
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg);
    localStorage.setItem('token', data.token);
    router.push('/');
  } catch (e) {
    error.value = e.message;
  }
};
</script>

<style scoped>
.login-container { display:flex; justify-content:center; align-items:center; min-height:100vh }
.glass {
  background: rgba(255,255,255,0.15);
  border-radius: 24px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.2);
  backdrop-filter: blur(12px) saturate(180%);
  padding: 2rem 3rem;
  text-align: center;
}
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
</style>
