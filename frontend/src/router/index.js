import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../store/auth';
import BooksView from '../views/BooksView.vue';
import LoansView from '../views/LoansView.vue';
import MembersView from '../views/MembersView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';

const routes = [
  { path: '/', name: 'books', component: BooksView },
  { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
  { path: '/loans', name: 'loans', component: LoansView, meta: { requiresAuth: true } },
  { path: '/members', name: 'members', component: MembersView, meta: { requiresAuth: true, role: 'librarian' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.role && auth.state.user?.role !== to.meta.role) {
    return { name: 'books' };
  }
  if (to.meta.guestOnly && auth.isAuthenticated.value) {
    return { name: 'books' };
  }
  return true;
});

export default router;
