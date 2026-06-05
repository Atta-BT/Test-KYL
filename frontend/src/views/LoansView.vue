<template>
  <div>
    <h1 class="page-title">Loans</h1>

    <div class="toolbar">
      <select v-model="filter" @change="load">
        <option value="">All loans</option>
        <option value="borrowed">Currently borrowed</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="RETURNED">Returned</option>
        <option value="OVERDUE">Overdue</option>
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
        <tr v-for="loan in loans" :key="loan.transaction_id">
          <td>
            <strong>{{ loan.book_title }}</strong><br />
            <span class="muted">{{ loan.book_author }}</span>
          </td>
          <td>{{ loan.member_name }}</td>
          <td>{{ formatDate(loan.borrow_date) }}</td>
          <td>{{ formatDate(loan.due_date) }}</td>
          <td>
            <span v-if="loan.status === 'RETURNED'" class="badge avail">Returned</span>
            <span v-else-if="loan.status === 'PENDING'" class="badge">Pending</span>
            <span v-else-if="loan.is_overdue" class="badge overdue">Overdue</span>
            <span v-else class="badge">Approved</span>
          </td>
          <td>
            <button
              v-if="loan.status === 'APPROVED' || loan.status === 'OVERDUE'"
              class="secondary"
              :disabled="returningId === loan.transaction_id"
              @click="returnBook(loan)"
            >
              {{ returningId === loan.transaction_id ? 'Returning...' : 'Return' }}
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
  returningId.value = loan.transaction_id;
  try {
    await returnLoan(loan.transaction_id);
    await load();
  } catch (e) {
    error.value = e?.response?.data?.error || 'Failed to return book';
  } finally {
    returningId.value = null;
  }
}

onMounted(load);
</script>
