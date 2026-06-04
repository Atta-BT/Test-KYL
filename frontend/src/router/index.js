import { createRouter, createWebHistory } from 'vue-router';
import BooksView from '../views/BooksView.vue';
import LoansView from '../views/LoansView.vue';
import MembersView from '../views/MembersView.vue';

const routes = [
  { path: '/', name: 'books', component: BooksView },
  { path: '/loans', name: 'loans', component: LoansView },
  { path: '/members', name: 'members', component: MembersView },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
