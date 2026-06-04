<template>
  <header class="navbar">
    <span class="brand">📚 Book Lending</span>
    <nav>
      <router-link to="/">Books</router-link>
      <router-link to="/loans">Loans</router-link>
      <router-link to="/members">Members</router-link>
    </nav>
  </header>
  <main class="container">
    <router-view />
  </main>
</template>

<script setup></script>
