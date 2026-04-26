<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const navItems = [
  { name: 'Home', path: '/', icon: 'bi-house' },
  { name: 'Explore', path: '/explore', icon: 'bi-compass' },
  { name: 'Create', path: '/create', icon: 'bi-plus-square', isCenter: true },
  { name: 'Notifications', path: '/notifications', icon: 'bi-bell' },
  { name: 'Profile', path: '/profile', icon: 'bi-person' },
]
</script>

<template>
  <nav class="h-16 flex items-center justify-around px-2 pb-safe bg-surface/90 backdrop-blur-lg border-t border-border md:hidden">
    <router-link 
      v-for="item in navItems" 
      :key="item.name"
      :to="item.path"
      class="flex flex-col items-center justify-center w-12 h-12 transition-colors relative"
      :class="route.path === item.path ? 'text-primary' : 'text-gray-400'"
    >
      <div v-if="item.isCenter" class="absolute -top-6 bg-primary text-black w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(5,204,71,0.4)]">
        <i class="bi bi-plus !text-3xl"></i>
      </div>
      <i v-else class="bi !text-3xl" :class="[route.path === item.path ? item.icon + '-fill' : item.icon]"></i>
    </router-link>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
