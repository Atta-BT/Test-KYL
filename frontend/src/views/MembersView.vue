<template>
  <div>
    <h1 class="page-title">Members</h1>

    <div class="toolbar">
      <button @click="showAdd = true">+ Add member</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">Loading...</p>

    <table v-if="members.length">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Joined</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in members" :key="m.id">
          <td>{{ m.name }}</td>
          <td>{{ m.email }}</td>
          <td>{{ m.phone || '-' }}</td>
          <td>{{ formatDate(m.joined_at) }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="showAdd" class="modal-backdrop" @click.self="showAdd = false">
      <div class="modal">
        <h3>Add member</h3>
        <div class="form-row">
          <label>Name</label>
          <input v-model="form.name" type="text" />
        </div>
        <div class="form-row">
          <label>Email</label>
          <input v-model="form.email" type="email" />
        </div>
        <div class="form-row">
          <label>Phone</label>
          <input v-model="form.phone" type="text" />
        </div>
        <p v-if="formError" class="error">{{ formError }}</p>
        <div class="modal-actions">
          <button class="secondary" @click="showAdd = false">Cancel</button>
          <button :disabled="submitting" @click="submit">
            {{ submitting ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getMembers, createMember } from '../api';

const members = ref([]);
const loading = ref(false);
const error = ref('');
const showAdd = ref(false);
const submitting = ref(false);
const formError = ref('');
const form = reactive({ name: '', email: '', phone: '' });

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

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

async function submit() {
  if (!form.name || !form.email) {
    formError.value = 'Name and email are required';
    return;
  }
  submitting.value = true;
  formError.value = '';
  try {
    await createMember({ name: form.name, email: form.email, phone: form.phone });
    showAdd.value = false;
    form.name = '';
    form.email = '';
    form.phone = '';
    await load();
  } catch (e) {
    formError.value = e?.response?.data?.error || 'Failed to add member';
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>
