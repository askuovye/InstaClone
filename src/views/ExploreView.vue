<script setup>
import { ref } from 'vue'
import ArtGrid from '../components/ArtGrid.vue'
import AppShell from '../components/AppShell.vue'
import { exploreGrid } from '../data/mock'

const categories = ['All', '3D Modeling', 'Concept Art', 'Cyberpunk', 'Animation', 'Photography', 'Abstract']
const activeCategory = ref('All')
</script>

<template>
  <AppShell>
    <div class="max-w-5xl mx-auto px-4 md:px-8 pt-4">
      <!-- Categories Header -->
      <div class="flex overflow-x-auto gap-2 pb-6 hide-scrollbar mb-4">
        <button 
          v-for="cat in categories" 
          :key="cat"
          @click="activeCategory = cat"
          class="whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-colors border"
          :class="activeCategory === cat ? 'bg-primary text-black border-primary' : 'bg-surface text-gray-300 border-border hover:border-gray-400'"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Masonry Grid -->
      <ArtGrid :items="exploreGrid" />
    </div>
  </AppShell>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
