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

    <p v-if="!auth.isAuthenticated.value" class="login-hint">
      You are browsing as a guest.
      <router-link to="/login" style="color: var(--primary); font-weight: 600">Sign in</router-link>
      to borrow books.
    </p>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">Loading...</p>

    <div v-if="!loading && !books.length" class="empty">No books found.</div>

    <div class="grid">
      <div v-for="book in books" :key="book.book_id" class="card">
        <div class="body">
          <span class="title">{{ book.title }}</span>
          <span class="author">{{ book.author }}</span>
          <span class="badge">{{ book.category_name || 'Uncategorized' }}</span>
          <span
            class="badge"
            :class="book.available_copies > 0 ? 'avail' : 'out'"
          >
            {{ book.available_copies }} / {{ book.total_copies }} available
          </span>

          <!-- Guest: cannot borrow, prompted to log in -->
          <button
            v-if="!auth.isAuthenticated.value"
            class="secondary"
            style="margin-top: 8px"
            @click="goLogin"
          >
            Sign in to borrow
          </button>

          <!-- Authenticated member/librarian -->
          <button
            v-else
            :disabled="book.available_copies < 1 || borrowingId === book.book_id"
            style="margin-top: 8px"
            @click="onBorrowClick(book)"
          >
            <template v-if="book.available_copies < 1">Unavailable</template>
            <template v-else-if="borrowingId === book.book_id">Borrowing...</template>
            <template v-else>Borrow</template>
          </button>
        </div>
      </div>
    </div>

    <BorrowModal
      v-if="modalBook"
      :book="modalBook"
      @close="modalBook = null"
      @borrowed="onBorrowed"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getBooks, getCategories, borrowBook } from '../api';
import { auth } from '../store/auth';
import BorrowModal from '../components/BorrowModal.vue';

const router = useRouter();
const books = ref([]);
const categories = ref([]);
const search = ref('');
const category = ref('');
const loading = ref(false);
const error = ref('');
const modalBook = ref(null);
const borrowingId = ref(null);
let timer = null;

function goLogin() {
  router.push('/login');
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

// Members borrow for themselves directly; librarians pick a member via modal.
async function onBorrowClick(book) {
  if (auth.isLibrarian.value) {
    modalBook.value = book;
    return;
  }
  borrowingId.value = book.book_id;
  error.value = '';
  try {
    await borrowBook({ book_id: book.book_id });
    await load();
  } catch (e) {
    error.value = e?.response?.data?.error || 'Failed to borrow book';
  } finally {
    borrowingId.value = null;
  }
}

function onBorrowed() {
  modalBook.value = null;
  load();
}

onMounted(async () => {
  await load();
  try {
    categories.value = await getCategories();
  } catch {
    // non-fatal
  }
});
</script>
