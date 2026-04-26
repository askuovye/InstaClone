<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'
import { feed as feedApi, posts as postsApi, likes as likesApi, users as usersApi } from '../services/api'
import AccountCard from '../components/profile/AccountCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const { user: authUser } = storeToRefs(authStore)

// ─── State ────────────────────────────────────────────────
const headerIn = ref(false)
const gridIn = ref(false)
const hoveredId = ref(null)

const explorePosts = ref([])
const isLoading = ref(true)
const loadError = ref(null)

const suggestedUsers = ref([])
const isSuggestionsLoading = ref(true)



// ─── Grid span patterns (visual variety) ──────────────────
const spanPatterns = ['hero', 'tall', 'tall', 'square', 'square', 'wide', 'square', 'square', 'tall', 'square', 'square', 'square']

function getSpan(index) {
  return spanPatterns[index % spanPatterns.length]
}

// ─── Load posts for explore ───────────────────────────────
async function loadExplorePosts() {
  isLoading.value = true
  loadError.value = null
  gridIn.value = false

  try {
    const allPosts = []

    // 1) Discover users by searching with common letter pairs (parallel)
    const queries = ['an', 'er', 'ar', 'in', 'th', 'es', 'te', 'us', 'al', 'or']
    const discoveredUsers = new Map() // id -> user

    const searchPromises = queries.map(q =>
      usersApi.search(q, { per_page: 10 }).catch(() => ({ data: [] }))
    )
    const searchResults = await Promise.all(searchPromises)

    for (const result of searchResults) {
      const users = Array.isArray(result.data) ? result.data : []
      for (const u of users) {
        if (!discoveredUsers.has(u.id)) {
          discoveredUsers.set(u.id, u)
        }
      }
    }

    // 2) Fetch posts from each discovered user (parallel, max 15 users)
    const userList = Array.from(discoveredUsers.values()).slice(0, 15)
    const postPromises = userList.map(u =>
      postsApi.byUser(u.id, 1).catch(() => ({ data: [] }))
    )
    const postResults = await Promise.all(postPromises)

    for (const result of postResults) {
      const posts = Array.isArray(result.data) ? result.data : []
      allPosts.push(...posts)
    }

    // 3) Also try the feed and own posts as extra sources
    try {
      const feedData = await feedApi.get({ per_page: 20 })
      if (Array.isArray(feedData.data)) allPosts.push(...feedData.data)
    } catch { /* ok */ }

    if (authUser.value?.id) {
      try {
        const ownData = await postsApi.byUser(authUser.value.id, 1)
        if (Array.isArray(ownData.data)) allPosts.push(...ownData.data)
      } catch { /* ok */ }
    }

    // 4) De-duplicate by post id
    const seen = new Set()
    const unique = allPosts.filter(p => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })

    // 5) Shuffle for random feel
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]]
    }

    explorePosts.value = unique
  } catch (e) {
    console.error('Explore load failed:', e)
    loadError.value = e.message || 'Failed to load posts'
  } finally {
    isLoading.value = false
    setTimeout(() => { gridIn.value = true }, 150)
  }
}

// ─── Like / Unlike ────────────────────────────────────────
async function toggleLike(post) {
  const wasLiked = post.liked_by_me
  post.liked_by_me = !wasLiked
  post.likes_count = (post.likes_count || 0) + (wasLiked ? -1 : 1)

  try {
    if (wasLiked) {
      await likesApi.unlike(post.id)
    } else {
      await likesApi.like(post.id)
    }
  } catch {
    post.liked_by_me = wasLiked
    post.likes_count = (post.likes_count || 0) + (wasLiked ? 1 : -1)
  }
}

// ─── Helpers ──────────────────────────────────────────────
function formatK(n) {
  if (!n) return '0'
  return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString()
}

function goToProfile(username) {
  if (username) router.push(`/profile/${username}`)
}

// ─── Load suggestions ───────────────────────────────────────
async function loadSuggestions() {
  isSuggestionsLoading.value = true
  try {
    const data = await usersApi.suggestions({ limit: 4 })
    suggestedUsers.value = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : [])
  } catch (e) {
    console.error('Failed to load suggestions:', e)
  } finally {
    isSuggestionsLoading.value = false
  }
}

// ─── Lifecycle ────────────────────────────────────────────
onMounted(async () => {
  setTimeout(() => { headerIn.value = true }, 80)
  loadSuggestions()
  await loadExplorePosts()
})
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
            <span class="material-symbols-rounded text-sm" :class="{ 'animate-spin': isLoading }">refresh</span>
            SHUFFLE
          </button>
        </div>
        <p class="text-xs text-white/25 mt-1">Discover posts from the community</p>
      </div>

      <!-- ── Content ── -->
      <div class="px-4 md:px-6 pt-5">

        <!-- ── Suggested Creators ── -->
        <div class="mb-8" v-if="!isSuggestionsLoading && suggestedUsers.length > 0">
          <h2 class="text-xs font-black tracking-widest text-white/40 mb-4 px-2">SUGGESTED FOR YOU</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AccountCard v-for="user in suggestedUsers" :key="user.id" :user="user" />
          </div>
        </div>

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
          <span class="material-symbols-rounded icon-filled text-red-400/30 mb-4" style="font-size: 3rem">error</span>
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
            <span class="material-symbols-rounded text-white/20" style="font-size: 2.5rem">photo_library</span>
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

          <div
            v-for="(post, i) in explorePosts" :key="post.id"
            @click="$router.push(`/posts/${post.id}`)"
            class="grid-item group cursor-pointer relative overflow-hidden rounded-xl"
            :class="[
              `span-${getSpan(i)}`,
              gridIn ? 'item-in' : 'item-out'
            ]"
            :style="{ animationDelay: (i * 50) + 'ms' }"
            @mouseenter="hoveredId = post.id"
            @mouseleave="hoveredId = null"
          >
            <!-- Post Image -->
            <div class="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
              <img v-if="post.image_url" :src="post.image_url"
                class="w-full h-full object-cover" :alt="post.caption || 'Post'" loading="lazy" />
              <div v-else class="w-full h-full bg-surface flex items-center justify-center">
                <span class="material-symbols-rounded text-white/10" style="font-size: 3rem">image</span>
              </div>
            </div>

            <!-- Scanline overlay -->
            <div class="scanlines absolute inset-0 opacity-10 pointer-events-none"></div>

            <!-- Vignette -->
            <div class="absolute inset-0 pointer-events-none"
              style="background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)"></div>

            <!-- Hover Overlay -->
            <Transition name="overlay-fade">
              <div v-if="hoveredId === post.id"
                class="absolute inset-0 flex flex-col items-center justify-center gap-3
                  bg-black/60 backdrop-blur-sm z-10">

                <!-- Like + Comment counts -->
                <div class="flex items-center gap-6">
                  <button @click.stop="toggleLike(post)" class="flex items-center gap-2 group/like">
                    <span class="material-symbols-rounded icon-filled text-2xl transition-all duration-200"
                      :class="post.liked_by_me ? 'text-primary scale-110' : 'text-white group-hover/like:scale-110'">
                      favorite
                    </span>
                    <span class="text-sm font-black" :class="post.liked_by_me ? 'text-primary' : 'text-white'">
                      {{ formatK(post.likes_count) }}
                    </span>
                  </button>

                  <div class="flex items-center gap-2">
                    <span class="material-symbols-rounded text-2xl text-white">chat_bubble</span>
                    <span class="text-sm font-black text-white">{{ post.comments_count || 0 }}</span>
                  </div>
                </div>

                <!-- Author -->
                <div class="flex items-center gap-2 mt-1 cursor-pointer hover:opacity-80 transition-opacity"
                  @click.stop="goToProfile(post.user?.username)">
                  <div class="w-7 h-7 rounded-full overflow-hidden bg-surface border border-border flex items-center justify-center flex-shrink-0">
                    <img v-if="post.user?.avatar_url" :src="post.user.avatar_url" class="w-full h-full object-cover" />
                    <span v-else class="material-symbols-rounded icon-filled text-white/30 text-sm">person</span>
                  </div>
                  <span class="text-xs font-bold text-white/80">{{ post.user?.username || 'Unknown' }}</span>
                </div>
              </div>
            </Transition>

            <!-- Corner accent -->
            <div class="absolute top-0 left-0 w-6 h-0.5 bg-primary/40 transition-all duration-300 group-hover:w-12 group-hover:bg-primary/80"></div>
            <div class="absolute top-0 left-0 w-0.5 h-6 bg-primary/40 transition-all duration-300 group-hover:h-12 group-hover:bg-primary/80"></div>
          </div>
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