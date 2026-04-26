import { createRouter, createWebHistory } from 'vue-router'
import { ROUTE_NAMES } from './routeNames'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: ROUTE_NAMES.LOGIN,
      component: () => import('../views/LoginView.vue'),
      meta: { hideNavigation: true, requiresGuest: true }
    },
    {
      path: '/register',
      name: ROUTE_NAMES.REGISTER,
      component: () => import('../views/RegisterView.vue'),
      meta: { hideNavigation: true, requiresGuest: true }
    },
    {
      path: '/feed',
      name: ROUTE_NAMES.FEED,
      component: () => import('../views/HomeView.vue'), // Renaming HomeView logic to Feed
      meta: { requiresAuth: true }
    },
    {
      path: '/discover',
      name: ROUTE_NAMES.DISCOVER,
      component: () => import('../views/ExploreView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/create',
      name: ROUTE_NAMES.CREATE_POST,
      component: () => import('../views/CreatePostView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: ROUTE_NAMES.PROFILE,
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/edit',
      name: ROUTE_NAMES.PROFILE_EDIT,
      component: () => import('../views/ProfileEditView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/:username',
      name: ROUTE_NAMES.USER_PROFILE,
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/list/:type',
      name: ROUTE_NAMES.CONNECTION_LIST,
      component: () => import('../views/ConnectionListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/posts/:postId',
      name: ROUTE_NAMES.POST_DETAIL,
      component: () => import('../views/PostDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/notifications',
      name: ROUTE_NAMES.NOTIFICATIONS,
      component: () => import('../views/NotificationsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: ROUTE_NAMES.NOT_FOUND,
      component: () => import('../views/NotFound.vue'),
    }
  ]
})

// Navigation guards
router.beforeEach((to) => {
  const token = localStorage.getItem('instaclone.token') || localStorage.getItem('auth_token')

  // Redirect to login if trying to access a protected route without auth
  if (to.meta.requiresAuth && !token) {
    return { name: ROUTE_NAMES.LOGIN, query: { redirect: to.fullPath } }
  }

  // Redirect to feed if trying to access guest-only routes while authenticated
  if (to.meta.requiresGuest && token) {
    return { name: ROUTE_NAMES.FEED }
  }
})

export default router
