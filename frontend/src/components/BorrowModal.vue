<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <h3>Borrow "{{ book.title }}"</h3>
      <div class="form-row">
        <label>Member</label>
        <select v-model="memberId">
          <option value="">Select a member...</option>
          <option v-for="m in members" :key="m.id" :value="m.id">
            {{ m.name }} ({{ m.email }})
          </option>
        </select>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="modal-actions">
        <button class="secondary" @click="$emit('close')">Cancel</button>
        <button :disabled="!memberId || submitting" @click="submit">
          {{ submitting ? 'Borrowing...' : 'Confirm borrow' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { borrowBook } from '../api';

const props = defineProps({
  book: { type: Object, required: true },
  members: { type: Array, default: () => [] },
});
const emit = defineEmits(['close', 'borrowed']);

const memberId = ref('');
const submitting = ref(false);
const error = ref('');

async function submit() {
  submitting.value = true;
  error.value = '';
  try {
    await borrowBook({ book_id: props.book.id, member_id: memberId.value });
    emit('borrowed');
  } catch (e) {
    error.value = e?.response?.data?.error || 'Failed to borrow book';
  } finally {
    submitting.value = false;
  }
}
</script>
