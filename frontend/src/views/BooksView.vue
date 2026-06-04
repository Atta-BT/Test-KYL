<template>
  <div>
    <h1 class="page-title">Books</h1>

    <div class="toolbar">
      <input
        v-model="search"
        type="text"
        placeholder="Search by title or author..."
        style="min-width: 260px"
        @input="debouncedLoad"
      />
      <select v-model="category" @change="load">
        <option value="">All categories</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">Loading...</p>

    <div v-if="!loading && !books.length" class="empty">No books found.</div>

    <div class="grid">
      <div v-for="book in books" :key="book.id" class="card">
        <div class="cover" :style="coverStyle(book)">
          <span v-if="!book.cover_url">No cover</span>
        </div>
        <div class="body">
          <span class="title">{{ book.title }}</span>
          <span class="author">{{ book.author }}</span>
          <span class="badge">{{ book.category || 'Uncategorized' }}</span>
          <span
            class="badge"
            :class="book.available_copies > 0 ? 'avail' : 'out'"
          >
            {{ book.available_copies }} / {{ book.total_copies }} available
          </span>
          <button
            :disabled="book.available_copies < 1"
            style="margin-top: 8px"
            @click="openBorrow(book)"
          >
            {{ book.available_copies > 0 ? 'Borrow' : 'Unavailable' }}
          </button>
        </div>
      </div>
    </div>

    <BorrowModal
      v-if="borrowBook"
      :book="borrowBook"
      :members="members"
      @close="borrowBook = null"
      @borrowed="onBorrowed"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getBooks, getCategories, getMembers } from '../api';
import BorrowModal from '../components/BorrowModal.vue';

const books = ref([]);
const categories = ref([]);
const members = ref([]);
const search = ref('');
const category = ref('');
const loading = ref(false);
const error = ref('');
const borrowBook = ref(null);
let timer = null;

function coverStyle(book) {
  return book.cover_url ? { backgroundImage: `url(${book.cover_url})` } : {};
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    books.value = await getBooks({
      search: search.value || undefined,
      category: category.value || undefined,
    });
  } catch (e) {
    error.value = e?.response?.data?.error || 'Failed to load books';
  } finally {
    loading.value = false;
  }
}

function debouncedLoad() {
  clearTimeout(timer);
  timer = setTimeout(load, 300);
}

function openBorrow(book) {
  borrowBook.value = book;
}

function onBorrowed() {
  borrowBook.value = null;
  load();
}

onMounted(async () => {
  await load();
  try {
    [categories.value, members.value] = await Promise.all([getCategories(), getMembers()]);
  } catch {
    // non-fatal
  }
});
</script>
