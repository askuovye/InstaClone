<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
    <div 
      v-for="item in items" 
      :key="item.id" 
      class="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer"
    >
      <img 
        :src="item.media" 
        alt="Art piece" 
        class="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
      >
      <!-- Hover Overlay -->
      <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
        <div class="flex justify-end">
          <button class="text-white hover:text-primary transition-colors">
            <i class="bi bi-bookmark"></i>
          </button>
        </div>
        <div class="flex items-center gap-4 text-white">
          <div class="flex items-center gap-1">
            <i class="bi bi-heart-fill text-sm"></i>
            <span class="text-xs font-bold">1.2k</span>
          </div>
          <div class="flex items-center gap-1">
            <i class="bi bi-chat-fill text-sm"></i>
            <span class="text-xs font-bold">48</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
