<script setup>
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import PostCard from '../post/PostCard.vue'
const props = defineProps({
  galleryItems: { type: Array, required: true },
  postsLoading: { type: Boolean, default: false },
  showGrid: { type: Boolean, default: false },
  isOwnProfile: { type: Boolean, default: false },
  postsPage: { type: Number, default: 1 },
  postsLastPage: { type: Number, default: 1 },
})

const emit = defineEmits(['navigate', 'load-more'])

const sentinel = ref(null)

useIntersectionObserver(sentinel, ([entry]) => {
  if (entry.isIntersecting && props.postsPage < props.postsLastPage && !props.postsLoading) {
    emit('load-more')
  }
})

function goToPost(id) {
  emit('navigate', `/posts/${id}`)
}
</script>

<template>
  <div class="profile-grid">
    <div class="gallery-header flex items-center justify-between mb-5"
      :class="showGrid ? 'opacity-100' : 'opacity-0'">
      <h2 class="text-sm font-black tracking-widest text-white/60">FEATURED DEVIATIONS</h2>
      <button class="text-xs font-bold tracking-widest text-primary hover:text-primary/70 transition-colors">
        VIEW ALL GALLERY →
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="galleryItems.length === 0 && !postsLoading" class="flex flex-col items-center justify-center py-24 text-center">
      <i class="bi bi-images text-white/10 mb-4" style="font-size: 4rem"></i>
      <p class="text-white/30 font-bold tracking-widest text-sm">NO POSTS YET</p>
      <p class="text-white/20 text-xs mt-1">{{ isOwnProfile ? 'Start sharing your work!' : 'This user hasn\'t posted yet.' }}</p>
    </div>

    <div v-else class="art-grid"
      :class="showGrid ? 'grid-in' : 'grid-out'">
      <PostCard
        v-for="(item, i) in galleryItems"
        :key="item.id"
        :post="item"
        :is-grid="true"
        :class="[
          'art-cell',
          item.span === 'large' ? 'art-large' : '',
          item.span === 'tall' ? 'art-tall' : '',
          item.span === 'wide' ? 'art-wide' : '',
          item.span === 'normal' ? 'art-normal' : '',
          showGrid ? 'grid-in' : 'grid-out'
        ]"
        :style="{ animationDelay: (i * 60) + 'ms' }"
        @navigate="(id) => $emit('navigate', `/posts/${id}`)"
      />
    </div>

    <!-- Sentinel for Infinite Scroll -->
    <div ref="sentinel" class="h-10 w-full flex items-center justify-center mt-6">
      <i v-if="postsLoading" class="bi bi-arrow-repeat text-primary text-2xl animate-spin"></i>
    </div>
  </div>
</template>

<style scoped>
/* Copied animations and layout for grid */
.art-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: 200px;
  gap: 16px;
  grid-auto-flow: dense;
}

@media (max-width: 768px) {
  .art-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 160px;
    gap: 8px;
  }
}

.art-large { grid-column: span 2; grid-row: span 2; }
.art-tall   { grid-row: span 2; }
.art-wide   { grid-column: span 2; }
.art-normal { grid-column: span 1; grid-row: span 1; }

.grid-out .art-cell { opacity: 0; transform: translateY(20px) scale(0.95); }
.grid-in .art-cell { opacity: 1; transform: translateY(0) scale(1); transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
</style>
