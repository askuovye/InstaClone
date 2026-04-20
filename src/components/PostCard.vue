<script setup>
import { ref } from 'vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const isLiked = ref(props.post.isLiked)
const isSaved = ref(props.post.isSaved)
const likesCount = ref(props.post.likes)

const toggleLike = () => {
  isLiked.value = !isLiked.value
  likesCount.value += isLiked.value ? 1 : -1
}
</script>

<template>
  <div class="bg-surface rounded-2xl overflow-hidden border border-border mb-6 hover-scale transition-all duration-300">
    <!-- Post Header -->
    <div class="flex items-center justify-between p-4">
      <div class="flex items-center gap-3">
        <router-link :to="`/profile?user=${post.user.username}`" class="w-10 h-10 rounded-full overflow-hidden border border-primary/30">
          <img :src="post.user.avatar" alt="Avatar" class="w-full h-full object-cover">
        </router-link>
        <div>
          <h3 class="font-bold text-sm text-white">@{{ post.user.username }}</h3>
          <p class="text-xs text-gray-400">{{ post.timeAgo }}</p>
        </div>
      </div>
      <button class="text-gray-400 hover:text-white">
        <span class="material-symbols-rounded">more_horiz</span>
      </button>
    </div>

    <!-- Post Image -->
    <div class="w-full bg-black aspect-[4/5] sm:aspect-square md:aspect-[4/3] lg:aspect-[16/9] relative group">
      <img :src="post.media" alt="Post media" class="w-full h-full object-cover">
      
      <!-- Double tap indicator overlay (visual only) -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity duration-200">
        <span class="material-symbols-rounded icon-filled text-white drop-shadow-2xl !text-7xl scale-50 group-active:scale-100 transition-transform">favorite</span>
      </div>
    </div>

    <!-- Post Actions -->
    <div class="p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-4">
          <button @click="toggleLike" class="flex items-center gap-1 group">
            <span class="material-symbols-rounded text-2xl transition-transform group-hover:scale-110" :class="isLiked ? 'icon-filled text-primary text-neon' : 'text-white'">favorite</span>
            <span class="text-sm font-semibold text-white">{{ likesCount }}</span>
          </button>
          <button class="flex items-center gap-1 group text-white">
            <span class="material-symbols-rounded text-2xl transition-transform group-hover:scale-110">chat_bubble</span>
            <span class="text-sm font-semibold">{{ post.comments }}</span>
          </button>
          <button class="text-white hover:text-primary transition-colors">
            <span class="material-symbols-rounded text-2xl">send</span>
          </button>
        </div>
        <button @click="isSaved = !isSaved" class="text-white transition-transform hover:scale-110">
          <span class="material-symbols-rounded text-2xl" :class="{ 'icon-filled text-primary': isSaved }">bookmark</span>
        </button>
      </div>

      <!-- Caption -->
      <p class="text-sm text-gray-300">
        <span class="font-bold text-white mr-2">@{{ post.user.username }}</span>
        {{ post.caption }}
      </p>
    </div>
  </div>
</template>
