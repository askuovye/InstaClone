<script setup>
import { ref } from 'vue'
import { timeAgo } from '../../utils/dates'

const props = defineProps({
  /**
   * The post object containing image_url, user, likes_count, etc.
   */
  post: {
    type: Object,
    required: true
  },
  /**
   * Whether the current logged-in user is the owner of this post.
   */
  isAuthUser: {
    type: Boolean,
    default: false
  },
  /**
   * Toggle between 'feed' (default) and 'grid' (explore/profile) visual modes.
   */
  isGrid: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['like', 'delete', 'navigate', 'navigate-profile', 'edit'])

const activeMenu = ref(false)

function handleNavigate() {
  emit('navigate', props.post.id)
}

function handleLike() {
  emit('like', props.post)
}

function handleDelete() {
  emit('delete', props.post)
}

function toggleMenu() {
  activeMenu.value = !activeMenu.value
}

function formatK(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}
</script>

<template>
  <!-- ─── GRID LAYOUT ─── -->
  <div v-if="isGrid"
    class="group cursor-pointer relative overflow-hidden rounded-xl h-full w-full"
    @click="handleNavigate"
  >
    <!-- Image -->
    <div class="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
      <img v-if="post.image_url" :src="post.image_url"
        class="w-full h-full object-cover" :alt="post.caption || 'Post'" loading="lazy" />
      <div v-else class="w-full h-full bg-surface flex items-center justify-center">
        <i class="bi bi-image text-white/10" style="font-size: 3rem"></i>
      </div>
    </div>

    <!-- Scanline overlay -->
    <div class="scanlines absolute inset-0 opacity-10 pointer-events-none"></div>

    <!-- Vignette -->
    <div class="absolute inset-0 pointer-events-none"
      style="background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)"></div>

    <!-- Hover Overlay -->
    <Transition name="overlay-fade">
      <div class="overlay-container absolute inset-0 flex flex-col items-center justify-center gap-3
          bg-black/60 backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

        <!-- Like + Comment counts -->
        <div class="flex items-center gap-6">
          <button @click.stop="handleLike" class="flex items-center gap-2 group/like">
            <i class="bi transition-all duration-200"
              :class="post.liked_by_me ? 'bi-heart-fill text-primary scale-110' : 'bi-heart text-white group-hover/like:scale-110'">
            </i>
            <span class="text-sm font-black" :class="post.liked_by_me ? 'text-primary' : 'text-white'">
              {{ formatK(post.likes_count) }}
            </span>
          </button>

          <div class="flex items-center gap-2">
            <i class="bi bi-chat-fill text-2xl text-white"></i>
            <span class="text-sm font-black text-white">{{ post.comments_count || 0 }}</span>
          </div>
        </div>

        <!-- Author -->
        <div class="flex items-center gap-2 mt-1 cursor-pointer hover:opacity-80 transition-opacity"
          @click.stop="emit('navigate-profile', post.user?.username)">
          <div class="w-7 h-7 rounded-full overflow-hidden bg-surface border border-border flex items-center justify-center flex-shrink-0">
            <img v-if="post.user?.avatar_url" :src="post.user.avatar_url" class="w-full h-full object-cover" />
            <i v-else class="bi bi-person-fill text-white/30 text-sm"></i>
          </div>
          <span class="text-xs font-bold text-white/80">{{ post.user?.username || 'Unknown' }}</span>
        </div>
      </div>
    </Transition>

    <!-- Corner accent -->
    <div class="absolute top-0 left-0 w-6 h-0.5 bg-primary/40 transition-all duration-300 group-hover:w-12 group-hover:bg-primary/80"></div>
    <div class="absolute top-0 left-0 w-0.5 h-6 bg-primary/40 transition-all duration-300 group-hover:h-12 group-hover:bg-primary/80"></div>
  </div>

  <!-- ─── FEED LAYOUT ─── -->
  <article v-else
    class="post-card mb-8"
  >
    <!-- Post Header -->
    <div class="post-header flex items-center gap-3 mb-3">
      <div class="w-10 h-10 rounded-xl overflow-hidden bg-surface border border-border
        flex items-center justify-center flex-shrink-0 cursor-pointer
        hover:border-primary/40 transition-colors"
        @click="emit('navigate-profile', post.user?.username)">
        <img v-if="post.user?.avatar_url" :src="post.user.avatar_url" class="w-full h-full object-cover" />
        <i v-else class="bi bi-person-fill text-white/30"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-black tracking-wider text-white cursor-pointer hover:text-primary transition-colors"
          @click="emit('navigate-profile', post.user?.username)">
          {{ post.user?.username || post.user?.name || 'Unknown' }}
        </p>
        <p class="text-xs text-white/25 font-bold">{{ timeAgo(post.created_at) }}</p>
      </div>
      <div class="relative post-menu-container">
        <button @click.stop="toggleMenu"
          class="w-8 h-8 flex items-center justify-center rounded-lg
          text-white/30 hover:text-white hover:bg-white/5 transition-all"
          :class="{ 'bg-white/10 text-white': activeMenu }">
          <i class="bi bi-three-dots-vertical text-xl"></i>
        </button>

        <!-- Dropdown Menu -->
        <Transition name="fade-scale">
          <div v-if="activeMenu"
            class="absolute right-0 mt-2 w-48 bg-[#1a1b23] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden"
            @click="activeMenu = false">
            <button @click="emit('navigate-profile', post.user?.username)"
              class="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left">
              <i class="bi bi-person-badge"></i>
              <span>Show the creator</span>
            </button>

            <button v-if="isAuthUser"
              @click="emit('edit', post.id)"
              class="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary/70 hover:text-primary hover:bg-primary/5 transition-colors text-left border-t border-white/5">
              <i class="bi bi-pencil-square"></i>
              <span>Edit post</span>
            </button>

            <button v-if="isAuthUser"
              @click="handleDelete"
              class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-colors text-left border-t border-white/5">
              <i class="bi bi-trash"></i>
              <span>Delete post</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Post Image -->
    <div @click="handleNavigate" class="post-image-wrap relative overflow-hidden rounded-xl cursor-pointer group"
      style="aspect-ratio: 1/1; min-height: 300px;">
      <img :src="post.image_url" :alt="post.caption || 'Post'"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 pointer-events-none"></div>
    </div>

    <!-- Post Actions -->
    <div class="post-actions flex items-center gap-4 mt-3 mb-2">
      <button @click="handleLike"
        class="flex items-center gap-1.5 group/like transition-all duration-200">
        <i class="bi transition-all duration-200"
          :class="post.liked_by_me
            ? 'bi-heart-fill text-primary scale-110 like-pop'
            : 'bi-heart text-white/40 group-hover/like:text-white/70 group-hover/like:scale-110'">
        </i>
        <span class="text-sm font-bold"
          :class="post.liked_by_me ? 'text-primary' : 'text-white/50'">
          {{ formatK(post.likes_count) }}
        </span>
      </button>

      <button @click="handleNavigate" class="flex items-center gap-1.5 group/cmt">
        <i class="bi bi-chat text-xl text-white/40
          group-hover/cmt:text-white/70 transition-colors"></i>
        <span class="text-sm font-bold text-white/50">{{ post.comments_count || 0 }}</span>
      </button>
    </div>

    <!-- Caption -->
    <div v-if="post.caption">
      <p class="text-sm text-white/65 leading-relaxed">
        <span class="font-bold text-white mr-1.5 cursor-pointer hover:text-primary transition-colors"
          @click="emit('navigate-profile', post.user?.username)">
          {{ post.user?.username || '' }}
        </span>
        {{ post.caption }}
      </p>
    </div>
  </article>
</template>

<style scoped>
/* ─── Shared Animations ─── */
.like-pop { animation: like-bounce 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes like-bounce {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.4); }
  100% { transform: scale(1.1); }
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

/* ─── Grid Specific ─── */
.scanlines {
  background: repeating-linear-gradient(
    to bottom, transparent, transparent 2px,
    rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px
  );
}

.overlay-fade-enter-active { transition: opacity 0.2s ease; }
.overlay-fade-leave-active { transition: opacity 0.15s ease; }
.overlay-fade-enter-from,
.overlay-fade-leave-to { opacity: 0; }
</style>
