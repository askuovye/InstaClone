<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthLayout from './layouts/AuthLayout.vue'
import AppLayout from './layouts/AppLayout.vue'

const route = useRoute()
const layout = computed(() => {
  // We use route.meta.requiresGuest to identify auth pages, fallback to AppLayout.
  if (route.meta.requiresGuest) return AuthLayout
  // Handle NotFound which has neither, fallback to AuthLayout just in case or AppLayout
  if (!route.meta.requiresAuth && !route.meta.requiresGuest) return AuthLayout
  return AppLayout
})
</script>

<template>
  <component :is="layout">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
