<template>
  <div>
    <h1 class="page-title">Members</h1>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">Loading...</p>

    <table v-if="members.length">
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in members" :key="m.user_id">
          <td>{{ m.username }}</td>
          <td>{{ m.email }}</td>
          <td>{{ m.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMembers } from '../api';

const members = ref([]);
const loading = ref(false);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    members.value = await getMembers();
  } catch (e) {
    error.value = e?.response?.data?.error || 'Failed to load members';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
