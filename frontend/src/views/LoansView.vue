<template>
  <div>
    <h1 class="page-title">Loans</h1>

    <div class="toolbar">
      <select v-model="filter" @change="load">
        <option value="">All loans</option>
        <option value="borrowed">Currently borrowed</option>
        <option value="returned">Returned</option>
        <option value="overdue">Overdue</option>
      </select>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">Loading...</p>

    <div v-if="!loading && !loans.length" class="empty">No loans found.</div>

    <table v-if="loans.length">
      <thead>
        <tr>
          <th>Book</th>
          <th>Member</th>
          <th>Borrowed</th>
          <th>Due</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="loan in loans" :key="loan.id">
          <td>
            <strong>{{ loan.book_title }}</strong><br />
            <span class="muted">{{ loan.book_author }}</span>
          </td>
          <td>{{ loan.member_name }}</td>
          <td>{{ formatDate(loan.borrowed_at) }}</td>
          <td>{{ formatDate(loan.due_date) }}</td>
          <td>
            <span v-if="loan.status === 'returned'" class="badge avail">Returned</span>
            <span v-else-if="loan.is_overdue" class="badge overdue">Overdue</span>
            <span v-else class="badge">Borrowed</span>
          </td>
          <td>
            <button
              v-if="loan.status === 'borrowed'"
              class="secondary"
              :disabled="returningId === loan.id"
              @click="returnBook(loan)"
            >
              {{ returningId === loan.id ? 'Returning...' : 'Return' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getLoans, returnLoan } from '../api';

const loans = ref([]);
const filter = ref('');
const loading = ref(false);
const error = ref('');
const returningId = ref(null);

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const params = {};
    if (filter.value === 'overdue') params.overdue = 'true';
    else if (filter.value) params.status = filter.value;
    loans.value = await getLoans(params);
  } catch (e) {
    error.value = e?.response?.data?.error || 'Failed to load loans';
  } finally {
    loading.value = false;
  }
}

async function returnBook(loan) {
  returningId.value = loan.id;
  try {
    await returnLoan(loan.id);
    await load();
  } catch (e) {
    error.value = e?.response?.data?.error || 'Failed to return book';
  } finally {
    returningId.value = null;
  }
}

onMounted(load);
</script>
