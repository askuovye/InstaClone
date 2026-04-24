import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ExploreView from '../views/ExploreView.vue'
import CreatePostView from '../views/CreatePostView.vue'
import ProfileView from '../views/ProfileView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { hideNavigation: true, guest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { hideNavigation: true, guest: true }
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true, hideNavigation: true }
    },
    {
      path: '/explore',
      name: 'explore',
      component: ExploreView,
      meta: { requiresAuth: true, hideNavigation: true }
    },
    {
      path: '/create',
      name: 'create',
      component: CreatePostView,
      meta: { requiresAuth: true, hideNavigation: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true, hideNavigation: true }
    },
    {
      path: '/profile/:username',
      name: 'user-profile',
      component: ProfileView,
      meta: { requiresAuth: true, hideNavigation: true }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: NotificationsView,
      meta: { requiresAuth: true, hideNavigation: true }
    }
  ]
})

// Navigation guards
router.beforeEach((to) => {
  const token = localStorage.getItem('auth_token')

  // Redirect to login if trying to access a protected route without auth
  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Redirect to home if trying to access guest-only routes while authenticated
  if (to.meta.guest && token) {
    return { name: 'home' }
  }
})

export default router
