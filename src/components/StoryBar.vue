<script setup>
defineProps({
  stories: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 snap-x hide-scrollbar">
    <!-- Add Story Button -->
    <div class="flex flex-col items-center gap-2 snap-start shrink-0">
      <div class="relative w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center cursor-pointer">
        <i class="bi bi-plus text-gray-400 !text-3xl"></i>
        <div class="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full border-2 border-dark"></div>
      </div>
      <span class="text-xs text-gray-400 font-medium">You</span>
    </div>

    <!-- User Stories -->
    <div v-for="story in stories" :key="story.id" class="flex flex-col items-center gap-2 snap-start shrink-0 cursor-pointer group">
      <div class="w-16 h-16 rounded-full p-[2px]" :class="story.hasUnseen ? 'bg-gradient-to-tr from-primary to-green-300' : 'bg-gray-600'">
        <div class="w-full h-full rounded-full border-2 border-dark overflow-hidden group-hover:scale-105 transition-transform">
          <img :src="story.user.avatar" alt="Story Avatar" class="w-full h-full object-cover">
        </div>
      </div>
      <span class="text-xs text-gray-400 font-medium w-16 truncate text-center">{{ story.user.username }}</span>
    </div>
  </div>
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
