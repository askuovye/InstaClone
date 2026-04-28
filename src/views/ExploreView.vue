<script setup>
import { ref, onMounted, computed } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'
import { postService as postsApi } from '../services/post.service'
import { userService as usersApi } from '../services/user.service'
import AccountCard from '../components/profile/AccountCard.vue'
import ExploreSuggestions from '../components/explore/ExploreSuggestions.vue'
import { useFollowsStore } from '../stores/follows'
import PostCard from '../components/post/PostCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const { user: authUser } = storeToRefs(authStore)
const followsStore = useFollowsStore()

// ─── State ────────────────────────────────────────────────
const headerIn = ref(false)
const gridIn = ref(false)

const explorePosts = ref([])
const exploreHasMore = ref(true)
const isLoading = ref(true)
const loadError = ref(null)

const suggestedUsers = ref([])
const isSuggestionsLoading = ref(true)

const sentinel = ref(null)

useIntersectionObserver(sentinel, ([entry]) => {
  if (entry.isIntersecting && exploreHasMore.value && !isLoading.value && !isSuggestionsLoading.value) {
    loadExplorePosts(true)
  }
})

// Reactive filtered list to hide followed users immediately
const filteredSuggestions = computed(() => {
  return suggestedUsers.value.filter(u => !followsStore.isFollowing(u.id))
})



// ─── Grid span patterns (visual variety) ──────────────────
const spanPatterns = ['hero', 'tall', 'tall', 'square', 'square', 'wide', 'square', 'square', 'tall', 'square', 'square', 'square']

function getSpan(index) {
  return spanPatterns[index % spanPatterns.length]
}

// ─── Load posts for explore ───────────────────────────────
async function loadExplorePosts(append = false) {
  if (!append) {
    isLoading.value = true
    explorePage.value = 1
    exploreHasMore.value = true
    gridIn.value = false
  }

  loadError.value = null

  try {
    // Wait for suggestions to be ready, then use their IDs
    let users = suggestedUsers.value

    // If suggestions haven't loaded yet, fetch them directly
    if (users.length === 0) {
      const data = await usersApi.suggestions({ limit: 40 })
      users = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : [])
      users = users.filter(u => u.id !== authUser.value?.id).slice(0, 8)
    }

    if (users.length === 0) {
      explorePosts.value = []
      exploreHasMore.value = false
      return
    }

    // Fetch posts from each user in parallel
    const results = await Promise.allSettled(
      users.map(u => postsApi.byUser(u.id, explorePage.value))
    )

    // Flatten all successful results
    const newPosts = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => Array.isArray(r.value?.data) ? r.value.data : [])

    // Shuffle for visual variety
    for (let i = newPosts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPosts[i], newPosts[j]] = [newPosts[j], newPosts[i]]
    }

    if (append) {
      explorePosts.value.push(...newPosts)
    } else {
      explorePosts.value = newPosts
    }

    // Has more if any user had results on this page
    exploreHasMore.value = newPosts.length > 0
    if (exploreHasMore.value) explorePage.value++

  } catch (e) {
    console.error('Explore load failed:', e)
    if (!append) loadError.value = e.message || 'Failed to load posts'
  } finally {
    isLoading.value = false
  }
}

// ─── Like / Unlike ────────────────────────────────────────
async function toggleLike(post) {
  const wasLiked = post.liked_by_me
  post.liked_by_me = !wasLiked
  post.likes_count = (post.likes_count || 0) + (wasLiked ? -1 : 1)

  try {
    if (wasLiked) {
      await postsApi.unlike(post.id)
    } else {
      await postsApi.like(post.id)
    }
  } catch {
    post.liked_by_me = wasLiked
    post.likes_count = (post.likes_count || 0) + (wasLiked ? 1 : -1)
  }
}

// ─── Helpers ──────────────────────────────────────────────
function goToProfile(username) {
  if (username) router.push(`/profile/${username}`)
}

// ─── Load suggestions ───────────────────────────────────────
async function loadSuggestions() {
  isSuggestionsLoading.value = true
  try {
    // Fetch a larger pool to find non-followed users
    const data = await usersApi.suggestions({ limit: 40 })
    let users = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : [])
    
    // Filter: Not following and not me
    const filtered = users.filter(u => {
      const isMe = u.id === authUser.value?.id
      const isFollowing = followsStore.isFollowing(u.id)
      return !isMe && !isFollowing
    })

    // Shuffle for randomness on refresh
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]]
    }

    // Limit to 5 as requested
    suggestedUsers.value = filtered.slice(0, 5)
  } catch (e) {
    console.error('Failed to load suggestions:', e)
  } finally {
    isSuggestionsLoading.value = false
  }
}

// ─── Lifecycle ────────────────────────────────────────────
onMounted(async () => {
  setTimeout(() => { headerIn.value = true }, 80)
  await loadFollowingIfNeeded()
  await loadSuggestions()         // await instead of fire-and-forget
  await loadExplorePosts()
  setTimeout(() => { gridIn.value = true }, 200)
})

async function loadFollowingIfNeeded() {
  if (authUser.value?.id && followsStore.followingIds.size === 0) {
    await followsStore.loadFollowing(authUser.value.id)
  }
}
</script>

<template>
  <div>
    <div class="explore-page pb-8">

      <!-- ── Page Header ── -->
      <div class="px-6 md:px-10 pt-6 pb-4 border-b border-border/50
        transition-all duration-600"
        :class="headerIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'">
        <div class="flex items-center justify-between">
          <h1 class="page-title font-black text-3xl tracking-tight">DISCOVER</h1>
          <button @click="loadExplorePosts" :disabled="isLoading"
            class="text-xs font-bold tracking-wider text-primary/60 hover:text-primary transition-colors
              disabled:opacity-50 flex items-center gap-1">
            <i class="bi bi-arrow-repeat text-sm" :class="{ 'animate-spin': isLoading }"></i>
            SHUFFLE
          </button>
        </div>
        <p class="text-xs text-white/25 mt-1">Discover posts from the community</p>
      </div>

      <!-- ── Content ── -->
      <div class="px-4 md:px-6 pt-5">

        <!-- ── Suggested Creators (Extracted) ── -->
        <ExploreSuggestions
          :suggestions="filteredSuggestions"
          :is-loading="isSuggestionsLoading"
          @refresh="loadSuggestions"
        />

        <!-- Loading -->
        <div v-if="isLoading" class="grid grid-cols-3 gap-2">
          <div v-for="i in 9" :key="i"
            class="rounded-xl bg-surface animate-pulse"
            :class="i === 1 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'">
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="loadError"
          class="flex flex-col items-center justify-center py-24 text-center">
          <i class="bi bi-exclamation-triangle-fill text-red-400/30 mb-4" style="font-size: 3rem"></i>
          <p class="text-white/40 font-bold tracking-wider text-sm mb-4">{{ loadError }}</p>
          <button @click="loadExplorePosts"
            class="px-5 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg
              text-xs font-black tracking-widest hover:bg-primary/20 transition-all">
            TRY AGAIN
          </button>
        </div>

        <!-- Empty -->
        <div v-else-if="explorePosts.length === 0"
          class="flex flex-col items-center justify-center py-24 text-center">
          <div class="w-20 h-20 rounded-2xl bg-surface/60 border border-border
            flex items-center justify-center mb-6">
            <i class="bi bi-images text-white/20" style="font-size: 2.5rem"></i>
          </div>
          <h2 class="text-lg font-black tracking-widest text-white/40 mb-2">NO POSTS YET</h2>
          <p class="text-sm text-white/20 max-w-sm">
            Create your first post or follow some users to see content here.
          </p>
          <router-link to="/create"
            class="mt-4 px-5 py-2 bg-primary text-black rounded-lg
              text-xs font-black tracking-widest hover:bg-primary/90 transition-all">
            CREATE A POST
          </router-link>
        </div>

        <!-- ═══ POST GRID ═══ -->
        <div v-else class="explore-grid"
          :class="gridIn ? 'grid-section-in' : 'grid-section-out'">

          <PostCard
            v-for="(post, i) in explorePosts"
            :key="post.id"
            :post="post"
            :is-grid="true"
            :class="[
              `span-${getSpan(i)}`,
              gridIn ? 'item-in' : 'item-out'
            ]"
            :style="{ animationDelay: (i * 50) + 'ms' }"
            @like="toggleLike"
            @navigate="(id) => $router.push(`/posts/${id}`)"
            @navigate-profile="goToProfile"
          />
        </div>

        <!-- Sentinel for Infinite Scroll -->
        <div ref="sentinel" class="h-10 w-full flex items-center justify-center">
          <i v-if="isLoading && explorePosts.length > 0" class="bi bi-arrow-repeat text-primary text-2xl animate-spin"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.explore-page { font-family: 'Inter', sans-serif; }

/* ─── Page title ─── */
.page-title {
  background: linear-gradient(135deg, #fff 50%, rgba(255,255,255,0.5) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-style: italic;
}

/* ─── Grid section entrance ─── */
.grid-section-out { opacity: 0; }
.grid-section-in  { animation: grid-section-appear 0.5s ease both; }

@keyframes grid-section-appear {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ─── Masonry Grid ─── */
.explore-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 180px;
  gap: 6px;
}

.span-hero   { grid-column: span 2; grid-row: span 2; }
.span-tall   { grid-column: span 1; grid-row: span 2; }
.span-wide   { grid-column: span 2; grid-row: span 1; }
.span-square { grid-column: span 1; grid-row: span 1; }

/* ─── Item entrance ─── */
.item-out { opacity: 0; transform: scale(0.96) translateY(12px); }
.item-in  { animation: item-appear 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }

@keyframes item-appear {
  from { opacity: 0; transform: scale(0.96) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* ─── Overlay fade ─── */
.overlay-fade-enter-active { transition: opacity 0.2s ease; }
.overlay-fade-leave-active { transition: opacity 0.15s ease; }
.overlay-fade-enter-from,
.overlay-fade-leave-to { opacity: 0; }

/* ─── Scanlines ─── */
.scanlines {
  background: repeating-linear-gradient(
    to bottom, transparent, transparent 2px,
    rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px
  );
}

/* ─── Responsive ─── */
@media (max-width: 900px) {
  .explore-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 160px;
  }
  .span-hero  { grid-column: span 2; grid-row: span 2; }
  .span-tall  { grid-column: span 1; grid-row: span 2; }
  .span-wide  { grid-column: span 2; grid-row: span 1; }
}

@media (max-width: 600px) {
  .explore-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 130px;
    gap: 4px;
  }
  .span-hero  { grid-column: span 2; grid-row: span 2; }
  .span-tall  { grid-column: span 1; grid-row: span 2; }
  .span-wide  { grid-column: span 2; grid-row: span 1; }
  .span-square{ grid-column: span 1; grid-row: span 1; }
}

/* ─── Pulse for skeleton ─── */
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.7; }
}
.animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
</style>