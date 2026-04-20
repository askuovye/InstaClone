<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const navItems = [
  { name: 'Home', path: '/', icon: 'home' },
  { name: 'Explore', path: '/explore', icon: 'explore' },
  { name: 'Notifications', path: '/notifications', icon: 'notifications' },
  { name: 'Profile', path: '/profile', icon: 'person' },
]
</script>

<template>
  <nav class="bg-surface/50 backdrop-blur-md px-6 py-8 flex-col justify-between hidden md:flex">
    <div>
      <div class="mb-10 text-center">
        <h1 class="text-3xl font-extrabold text-white tracking-widest uppercase">
          Kinetic<span class="text-primary">.</span>
        </h1>
      </div>

      <ul class="flex flex-col gap-2">
        <li v-for="item in navItems" :key="item.name">
          <router-link 
            :to="item.path"
            class="flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group"
            :class="route.path === item.path ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'"
          >
            <span class="material-symbols-rounded transition-transform group-hover:scale-110" :class="{ 'icon-filled': route.path === item.path }">
              {{ item.icon }}
            </span>
            <span class="text-lg">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </div>
    
    <div class="mt-auto">
      <router-link to="/login" class="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white transition-colors">
        <span class="material-symbols-rounded">logout</span>
        <span class="text-lg">Sign Out</span>
      </router-link>
    </div>
  </nav>
</template>
