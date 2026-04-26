<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useFeedStore } from '../stores/feed'
import { storeToRefs } from 'pinia'
import { timeAgo } from '../utils/dates'

const router = useRouter()
const authStore = useAuthStore()
const feedStore = useFeedStore()

const { user: authUser } = storeToRefs(authStore)
const {
  posts: feedPosts,
  loading: feedLoading,
  loadingMore,
  error: feedError,
  initialLoad,
  hasMore,
  feedSource
} = storeToRefs(feedStore)

const feedVisible = ref(false)

const loadFeed = (append = false) => feedStore.loadFeed(append)
const toggleLike = (post) => feedStore.toggleLike(post.id)

// ─── Helpers ──────────────────────────────────────────────
function formatK(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

// Local timeAgo is now imported from utils/dates.js

function navigateToProfile(username) {
  if (username) router.push(`/profile/${username}`)
}

// ─── Scroll (infinite scroll) ─────────────────────────────
let scrollHandler = null

onMounted(async () => {
  if (feedPosts.value.length === 0) {
    await loadFeed()
  }
  setTimeout(() => { feedVisible.value = true }, 150)

  scrollHandler = () => {
    if (hasMore.value && !loadingMore.value) {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 600
      if (nearBottom) loadFeed(true)
    }
  }
  window.addEventListener('scroll', scrollHandler)
})

onUnmounted(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})
</script>

<template>
  <div>
    <div class="flex justify-center pb-8">

      <!-- ═══ MAIN FEED ═══ -->
      <main class="feed-column w-full max-w-[480px] lg:max-w-[520px] flex-shrink-0 px-4 md:px-0 pt-4">

        <!-- Feed Header -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-black tracking-widest text-white/40">
            {{ feedSource === 'own' ? 'YOUR POSTS' : 'YOUR FEED' }}
          </h2>
          <button @click="feedSource = 'feed'; loadFeed(false)" :disabled="feedLoading"
            class="text-xs font-bold tracking-wider text-primary/60 hover:text-primary transition-colors
              disabled:opacity-50 flex items-center gap-1">
            <span class="material-symbols-rounded text-sm" :class="{ 'animate-spin': feedLoading }">refresh</span>
            REFRESH
          </button>
        </div>

        <!-- Own posts hint -->
        <div v-if="feedSource === 'own' && feedPosts.length > 0"
          class="mb-6 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-3">
          <span class="material-symbols-rounded text-primary/50 text-sm mt-0.5">info</span>
          <div>
            <p class="text-xs text-white/40">Your feed is empty because you're not following anyone yet.</p>
            <p class="text-xs text-white/40 mt-0.5">Here are your own posts. 
              <router-link to="/explore" class="text-primary/70 hover:text-primary font-bold transition-colors">Discover people to follow →</router-link>
            </p>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="initialLoad && feedLoading" class="flex flex-col gap-8">
          <div v-for="i in 3" :key="i" class="animate-pulse">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-surface"></div>
              <div class="flex-1"><div class="h-3 bg-surface rounded w-24 mb-1.5"></div><div class="h-2 bg-surface/60 rounded w-16"></div></div>
            </div>
            <div class="aspect-square rounded-xl bg-surface"></div>
            <div class="mt-3 h-3 bg-surface rounded w-3/4"></div>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="feedError && feedPosts.length === 0"
          class="flex flex-col items-center justify-center py-20 text-center">
          <span class="material-symbols-rounded icon-filled text-red-400/30 mb-4" style="font-size: 3rem">error</span>
          <p class="text-white/40 font-bold tracking-wider text-sm mb-2">COULDN'T LOAD FEED</p>
          <p class="text-white/20 text-xs mb-4">{{ feedError }}</p>
          <button @click="loadFeed(false)"
            class="px-5 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg
              text-xs font-black tracking-widest hover:bg-primary/20 transition-all">
            TRY AGAIN
          </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="!feedLoading && feedPosts.length === 0"
          class="flex flex-col items-center justify-center py-20 text-center">
          <span class="material-symbols-rounded icon-filled text-white/10 mb-4" style="font-size: 4rem">dynamic_feed</span>
          <p class="text-white/30 font-bold tracking-widest text-sm mb-1">YOUR FEED IS EMPTY</p>
          <p class="text-white/20 text-xs">Follow some users to see their posts here.</p>
          <router-link to="/explore"
            class="mt-4 px-5 py-2 bg-primary text-black rounded-lg
              text-xs font-black tracking-widest hover:bg-primary/90 transition-all">
            DISCOVER PEOPLE
          </router-link>
        </div>

        <!-- Posts -->
        <div v-else class="posts-list flex flex-col gap-0 transition-all duration-500"
          :class="feedVisible ? 'opacity-100' : 'opacity-0'">

          <article v-for="(post, i) in feedPosts" :key="post.id"
            class="post-card mb-8"
            :class="feedVisible ? 'post-in' : 'post-out'"
            :style="{ animationDelay: (i * 80) + 'ms' }">

            <!-- Post Header -->
            <div class="post-header flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl overflow-hidden bg-surface border border-border
                flex items-center justify-center flex-shrink-0 cursor-pointer
                hover:border-primary/40 transition-colors"
                @click="navigateToProfile(post.user?.username)">
                <img v-if="post.user?.avatar_url" :src="post.user.avatar_url" class="w-full h-full object-cover" />
                <span v-else class="material-symbols-rounded icon-filled text-white/30">person</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-black tracking-wider text-white cursor-pointer hover:text-primary transition-colors"
                  @click="navigateToProfile(post.user?.username)">
                  {{ post.user?.username || post.user?.name || 'Unknown' }}
                </p>
                <p class="text-xs text-white/25 font-bold">{{ timeAgo(post.created_at) }}</p>
              </div>
              <button class="w-8 h-8 flex items-center justify-center rounded-lg
                text-white/30 hover:text-white hover:bg-white/5 transition-all">
                <span class="material-symbols-rounded text-xl">more_vert</span>
              </button>
            </div>

            <!-- Post Image -->
            <div @click="$router.push(`/posts/${post.id}`)" class="post-image-wrap relative overflow-hidden rounded-xl cursor-pointer group"
              style="aspect-ratio: 1/1; min-height: 300px;">
              <img :src="post.image_url" :alt="post.caption || 'Post'"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 pointer-events-none"></div>
            </div>

            <!-- Post Actions -->
            <div class="post-actions flex items-center gap-4 mt-3 mb-2">
              <button @click="toggleLike(post)"
                class="flex items-center gap-1.5 group/like transition-all duration-200">
                <span class="material-symbols-rounded icon-filled text-xl transition-all duration-200"
                  :class="post.liked_by_me
                    ? 'text-primary scale-110 like-pop'
                    : 'text-white/40 group-hover/like:text-white/70 group-hover/like:scale-110'">
                  favorite
                </span>
                <span class="text-sm font-bold"
                  :class="post.liked_by_me ? 'text-primary' : 'text-white/50'">
                  {{ formatK(post.likes_count) }}
                </span>
              </button>

              <button @click="$router.push(`/posts/${post.id}`)" class="flex items-center gap-1.5 group/cmt">
                <span class="material-symbols-rounded text-xl text-white/40
                  group-hover/cmt:text-white/70 transition-colors">chat_bubble</span>
                <span class="text-sm font-bold text-white/50">{{ post.comments_count || 0 }}</span>
              </button>

              <button class="flex items-center justify-center w-8 h-8 rounded-lg
                text-white/40 hover:text-white/70 transition-colors">
                <span class="material-symbols-rounded icon-filled text-xl">send</span>
              </button>
            </div>

            <!-- Caption -->
            <div v-if="post.caption">
              <p class="text-sm text-white/65 leading-relaxed">
                <span class="font-bold text-white mr-1.5 cursor-pointer hover:text-primary transition-colors"
                  @click="navigateToProfile(post.user?.username)">
                  {{ post.user?.username || '' }}
                </span>
                {{ post.caption }}
              </p>
            </div>
          </article>

          <!-- Loading more -->
          <div v-if="loadingMore" class="flex justify-center py-6">
            <span class="material-symbols-rounded text-primary text-2xl animate-spin">autorenew</span>
          </div>

          <!-- End of feed -->
          <div v-if="!hasMore && feedPosts.length > 0" class="flex flex-col items-center py-8 text-center">
            <span class="material-symbols-rounded icon-filled text-white/10 mb-2" style="font-size: 2rem">check_circle</span>
            <p class="text-white/25 text-xs font-bold tracking-widest">YOU'RE ALL CAUGHT UP</p>
          </div>
        </div>
      </main>

      <!-- Desktop Right Sidebar -->
      <aside class="desktop-sidebar flex-col gap-5 w-64 flex-shrink-0 pt-6 pl-8
        sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div v-if="authUser" class="flex items-center gap-3 mb-2">
          <router-link to="/profile"
            class="w-11 h-11 rounded-xl bg-surface border-2 border-primary/30
              flex items-center justify-center overflow-hidden hover:border-primary/60 transition-colors">
            <img v-if="authUser.avatar_url" :src="authUser.avatar_url" class="w-full h-full object-cover" />
            <span v-else class="material-symbols-rounded icon-filled text-white/30 text-xl">person</span>
          </router-link>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-black text-white truncate">{{ authUser.username || authUser.name }}</p>
            <p class="text-xs text-white/25 truncate">{{ authUser.name }}</p>
          </div>
        </div>

        <div class="mt-auto px-1 flex flex-wrap gap-x-3 gap-y-1">
          <a v-for="link in ['Terms', 'Privacy', 'Help', 'API']" :key="link"
            href="#" class="text-xs text-white/15 hover:text-white/40 transition-colors">
            {{ link }}
          </a>
          <span class="text-xs text-white/10 w-full mt-1">© 2025 KINETIC</span>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* ─── Post entrance ─── */
.post-out { opacity: 0; transform: translateY(20px); }
.post-in  { animation: post-appear 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }

@keyframes post-appear {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Like pop ─── */
.like-pop { animation: like-bounce 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }

@keyframes like-bounce {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.4); }
  100% { transform: scale(1.1); }
}

/* ─── Sidebar scrollbar ─── */
aside {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

/* ─── Desktop sidebar: hidden on mobile, flex on lg+ ─── */
.desktop-sidebar {
  display: none;
}
@media (min-width: 1024px) {
  .desktop-sidebar {
    display: flex;
  }
}

/* ─── Skeleton pulse ─── */
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.7; }
}
.animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
</style>