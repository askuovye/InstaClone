<script setup>
const props = defineProps({
  galleryItems: { type: Array, required: true },
  postsLoading: { type: Boolean, default: false },
  showGrid: { type: Boolean, default: false },
  isOwnProfile: { type: Boolean, default: false },
  postsPage: { type: Number, default: 1 },
  postsLastPage: { type: Number, default: 1 },
})

const emit = defineEmits(['navigate', 'load-more'])

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
      <div v-for="(item, i) in galleryItems" :key="item.id"
        @click="goToPost(item.id)"
        class="art-cell group cursor-pointer rounded-xl overflow-hidden relative"
        :class="[
          item.span === 'large' ? 'art-large' : '',
          item.span === 'tall' ? 'art-tall' : '',
          item.span === 'wide' ? 'art-wide' : '',
          item.span === 'normal' ? 'art-normal' : '',
        ]"
        :style="{ animationDelay: (i * 60) + 'ms' }">
        <!-- Real post image -->
        <div class="art-bg absolute inset-0 transition-transform duration-500 group-hover:scale-110">
          <img :src="item.image_url" :alt="item.caption || 'Post'" class="w-full h-full object-cover" />
        </div>

        <!-- Hover overlay -->
        <div class="art-overlay absolute inset-0 flex flex-col items-center justify-center
          opacity-0 group-hover:opacity-100 transition-all duration-300
          bg-black/60 backdrop-blur-sm">
          <i class="bi bi-arrows-fullscreen text-white text-3xl mb-2"></i>
          <span v-if="item.caption" class="text-xs font-bold text-white/60 tracking-wider px-4 text-center line-clamp-2">{{ item.caption }}</span>
          <span v-else class="text-xs font-bold text-white/60 tracking-wider">VIEW POST</span>
        </div>
      </div>
    </div>

    <!-- Load more posts -->
    <button v-if="postsPage < postsLastPage"
      @click="$emit('load-more')"
      :disabled="postsLoading"
      class="load-more w-full mt-6 py-4 border border-border rounded-xl
        text-xs font-black tracking-widest text-white/30
        hover:border-primary/30 hover:text-primary/70 transition-all duration-300
        flex items-center justify-center gap-2 disabled:opacity-50">
      <i v-if="postsLoading" class="bi bi-arrow-repeat text-sm animate-spin"></i>
      <template v-else>
        <i class="bi bi-chevron-down text-sm"></i>
        LOAD MORE POSTS
      </template>
    </button>
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
