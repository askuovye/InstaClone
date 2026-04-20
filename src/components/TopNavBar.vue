<script setup>
import { currentUser } from '../data/mock'
</script>

<template>
  <header class="h-16 flex items-center justify-between px-4 lg:px-8 bg-surface/80 backdrop-blur-md border-b border-border">
    <div class="flex items-center gap-4">
      <h1 class="text-xl font-bold text-neon md:hidden tracking-wider">KINETIC</h1>
      
      <!-- Search Input -->
      <div class="hidden md:flex relative items-center">
        <span class="material-symbols-rounded absolute left-3 text-gray-400">search</span>
        <input 
          type="text" 
          placeholder="Search art, artists, tags..." 
          class="bg-[#12131a] text-sm text-white rounded-full py-2 pl-10 pr-4 w-64 border border-border focus:outline-none focus:border-primary transition-colors"
        >
      </div>
    </div>

    <div class="flex items-center gap-4">
      <router-link to="/create" class="hidden md:flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-full font-semibold hover-scale">
        <span class="material-symbols-rounded icon-filled">add_circle</span>
        <span>Upload</span>
      </router-link>
      
      <router-link to="/notifications" class="relative text-gray-300 hover:text-white transition-colors">
        <span class="material-symbols-rounded">notifications</span>
        <span class="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
      </router-link>

      <router-link to="/profile" class="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors">
        <img :src="currentUser.avatar" alt="User Avatar" class="w-full h-full object-cover">
      </router-link>
    </div>
  </header>
</template>
