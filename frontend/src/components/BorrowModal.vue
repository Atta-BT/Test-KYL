<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <h3>Borrow "{{ book.title }}"</h3>
      <p class="muted">Confirm borrowing this book?</p>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="modal-actions">
        <button class="secondary" @click="$emit('close')">Cancel</button>
        <button :disabled="submitting" @click="submit">
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
});
const emit = defineEmits(['close', 'borrowed']);

const submitting = ref(false);
const error = ref('');

async function submit() {
  submitting.value = true;
  error.value = '';
  try {
    await borrowBook({ book_id: props.book.book_id });
    emit('borrowed');
  } catch (e) {
    error.value = e?.response?.data?.error || 'Failed to borrow book';
  } finally {
    submitting.value = false;
  }
}
</script>
