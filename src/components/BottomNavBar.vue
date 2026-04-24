<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const navItems = [
  { name: 'Home', path: '/', icon: 'home' },
  { name: 'Explore', path: '/explore', icon: 'explore' },
  { name: 'Create', path: '/create', icon: 'add_box', isCenter: true },
  { name: 'Notifications', path: '/notifications', icon: 'notifications' },
  { name: 'Profile', path: '/profile', icon: 'person' },
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
        <span class="material-symbols-rounded icon-filled !text-3xl">add</span>
      </div>
      <span v-else class="material-symbols-rounded !text-3xl" :class="{ 'icon-filled': route.path === item.path }">
        {{ item.icon }}
      </span>
    </router-link>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
