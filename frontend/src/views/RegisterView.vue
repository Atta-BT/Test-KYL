<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <h1>Create account</h1>
      <p class="muted">Register as a library member.</p>
      <form @submit.prevent="submit">
        <div class="form-row">
          <label>Name</label>
          <input v-model="name" type="text" required />
        </div>
        <div class="form-row">
          <label>Email</label>
          <input v-model="email" type="email" autocomplete="username" required />
        </div>
        <div class="form-row">
          <label>Phone (optional)</label>
          <input v-model="phone" type="text" />
        </div>
        <div class="form-row">
          <label>Password (min 6 chars)</label>
          <input v-model="password" type="password" autocomplete="new-password" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading" style="width: 100%">
          {{ loading ? 'Creating...' : 'Create account' }}
        </button>
      </form>
      <p class="muted" style="margin-top: 14px">
        Already have an account?
        <router-link to="/login" style="color: var(--primary)">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '../api';
import { auth } from '../store/auth';

const router = useRouter();
const name = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    const { token, user } = await register({
      name: name.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
    });
    auth.setSession(token, user);
    router.push('/');
  } catch (e) {
    error.value = e?.response?.data?.error || 'Registration failed';
  } finally {
    loading.value = false;
  }
}
</script>
