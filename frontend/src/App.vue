<template>
  <header class="navbar">
    <span class="brand">📚 Book Lending</span>
    <nav>
      <router-link to="/">Books</router-link>
      <router-link v-if="auth.isAuthenticated.value" to="/loans">
        {{ auth.isLibrarian.value ? 'Loans' : 'My Loans' }}
      </router-link>
      <router-link v-if="auth.isLibrarian.value" to="/members">Members</router-link>
    </nav>
    <div class="spacer" />
    <div class="user-area">
      <template v-if="auth.isAuthenticated.value">
        <span class="who">
          {{ auth.state.user.name }}
          <span class="role-badge">{{ auth.state.user.role }}</span>
        </span>
        <button class="secondary small" @click="logout">Logout</button>
      </template>
      <template v-else>
        <router-link to="/login" class="navlink">Sign in</router-link>
        <router-link to="/register" class="navlink">Register</router-link>
      </template>
    </div>
  </header>
  <main class="container">
    <router-view />
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { auth } from './store/auth';

const router = useRouter();

function logout() {
  auth.logout();
  router.push('/login');
}
</script>
