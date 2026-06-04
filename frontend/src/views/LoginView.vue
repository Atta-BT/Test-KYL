<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <h1>Sign in</h1>
      <p class="muted">Sign in to borrow books and manage loans.</p>
      <form @submit.prevent="submit">
        <div class="form-row">
          <label>Email</label>
          <input v-model="email" type="email" autocomplete="username" required />
        </div>
        <div class="form-row">
          <label>Password</label>
          <input v-model="password" type="password" autocomplete="current-password" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading" style="width: 100%">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
      <p class="muted" style="margin-top: 14px">
        No account? <router-link to="/register" style="color: var(--primary)">Register</router-link>
      </p>
      <div class="demo-box">
        <strong>Demo accounts</strong> (password: <code>password123</code>)
        <div>Librarian: <code>librarian@example.com</code></div>
        <div>Member: <code>john@example.com</code></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { login } from '../api';
import { auth } from '../store/auth';

const router = useRouter();
const route = useRoute();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    const { token, user } = await login({ email: email.value, password: password.value });
    auth.setSession(token, user);
    router.push(route.query.redirect || '/');
  } catch (e) {
    error.value = e?.response?.data?.error || 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>
