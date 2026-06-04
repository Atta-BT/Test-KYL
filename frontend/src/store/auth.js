import { reactive, computed } from 'vue';

const TOKEN_KEY = 'bl_token';
const USER_KEY = 'bl_user';

const state = reactive({
  token: localStorage.getItem(TOKEN_KEY) || null,
  user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
});

export const auth = {
  state,
  isAuthenticated: computed(() => !!state.token),
  isLibrarian: computed(() => state.user?.role === 'librarian'),
  isMember: computed(() => state.user?.role === 'member'),

  setSession(token, user) {
    state.token = token;
    state.user = user;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
