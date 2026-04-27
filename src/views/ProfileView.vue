<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'
import { users, posts, follow } from '../services/api'

import ProfileHeader from '../components/profile/ProfileHeader.vue'
import ProfileStats from '../components/profile/ProfileStats.vue'
import ProfileTabs from '../components/profile/ProfileTabs.vue'
import ProfileGrid from '../components/profile/ProfileGrid.vue'
import EditProfileModal from '../components/profile/EditProfileModal.vue'

const route = useRoute()
const authStore = useAuthStore()
const { user: authUser } = storeToRefs(authStore)
const { hydrateAuthState } = authStore

// ─── State ───────────────────────────────────────────────
const activeTab = ref('recent')
const isWatching = ref(false)
const isLoading = ref(true)
const headerVisible = ref(false)
const statsAnimated = ref(false)
const animatedWatchers = ref(0)
const animatedDeviations = ref(0)
const animatedViews = ref(0)
const showBanner = ref(false)
const showAvatar = ref(false)
const showMeta = ref(false)
const showStats = ref(false)
const showTabs = ref(false)
const showGrid = ref(false)
const showSidebar = ref(false)

// ─── Avatar & Bio Edit State ─────────────────────────────
const avatarInput = ref(null)
const avatarUploading = ref(false)
const avatarPreview = ref(null)
const showEditModal = ref(false)
const editBio = ref('')
const bioSaving = ref(false)
const toastMessage = ref('')
const toastVisible = ref(false)
const toastType = ref('success') // 'success' | 'error'

// ─── Profile Data (populated from API) ────────────────────
const profile = ref({
  id: null,
  username: '',
  name: '',
  bio: '',
  avatar_url: null,
  created_at: '',
  followers_count: 0,
  following_count: 0,
  posts_count: 0,
  bannerGradient: 'linear-gradient(135deg, #0a0b10 0%, #0d1a10 40%, #071510 70%, #0a0b10 100%)',
})

// Posts loaded from API
const userPosts = ref([])
const postsPage = ref(1)
const postsLastPage = ref(1)
const postsLoading = ref(false)

// Activity (derived from recent posts)
const activity = ref([])



const tabs = [
  { key: 'recent', label: 'RECENT ART' },
  { key: 'collections', label: 'COLLECTIONS' },
  { key: 'about', label: 'ABOUT' },
]

// ─── Computed ─────────────────────────────────────────────
const profileUsername = computed(() => route.params.username || route.query.user || authUser.value?.username)

const isOwnProfile = computed(() => {
  if (!authUser.value || !profile.value.id) return false
  return authUser.value.id === profile.value.id
})

const formattedJoinDate = computed(() => {
  if (!profile.value.created_at) return ''
  const d = new Date(profile.value.created_at)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
})

// Grid layout spans for posts
const spanPatterns = ['large', 'tall', 'normal', 'normal', 'wide', 'normal', 'normal', 'wide']

const galleryItems = computed(() => {
  return userPosts.value.map((post, i) => ({
    id: post.id,
    image_url: post.image_url,
    caption: post.caption,
    span: spanPatterns[i % spanPatterns.length],
  }))
})

function formatNumber(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

// ─── API: Load profile ────────────────────────────────────
async function loadProfile() {
  const username = profileUsername.value
  if (!username) return

  isLoading.value = true

  try {
    const userData = await users.getProfile(username)

    profile.value = {
      ...profile.value,
      id: userData.id,
      username: userData.username || userData.name,
      name: userData.name,
      bio: userData.bio || '',
      avatar_url: userData.avatar_url,
      created_at: userData.created_at,
      followers_count: 0,
      following_count: 0,
      posts_count: 0,
    }

    // Load posts (also gives us total count)
    await loadPosts(true)

    // Load followers/following counts
    await loadFollowCounts(userData.id)

    // Check follow status if not own profile
    if (!isOwnProfile.value) {
      await checkFollowStatus(userData.id)
    }

  } catch (e) {
    console.error('Failed to load profile:', e)
  } finally {
    isLoading.value = false
  }
}

// ─── API: Load posts ──────────────────────────────────────
async function loadPosts(reset = false) {
  if (postsLoading.value) return
  if (!profile.value.id) return

  postsLoading.value = true

  try {
    if (reset) {
      postsPage.value = 1
      userPosts.value = []
    }

    const data = await posts.byUser(profile.value.id, postsPage.value)

    if (reset) {
      userPosts.value = data.data
    } else {
      userPosts.value.push(...data.data)
    }

    postsLastPage.value = data.last_page
    profile.value.posts_count = data.total

    // Build activity from recent posts
    if (reset && data.data.length > 0) {
      const icons = ['upload', 'palette', 'star-fill']
      const colors = ['#4090ff', '#05cc47', '#f0c040']
      activity.value = data.data.slice(0, 3).map((p, i) => ({
        icon: icons[i % 3],
        label: 'Posted',
        link: p.caption ? p.caption.substring(0, 30) : `Post #${p.id}`,
        time: timeAgo(p.created_at),
        color: colors[i % 3],
      }))
    }
  } catch (e) {
    console.error('Failed to load posts:', e)
  } finally {
    postsLoading.value = false
  }
}

async function loadMorePosts() {
  if (postsPage.value >= postsLastPage.value) return
  postsPage.value++
  await loadPosts()
}

// ─── API: Follow counts ──────────────────────────────────
async function loadFollowCounts(userId) {
  try {
    const [followersData, followingData] = await Promise.all([
      follow.followers(userId, 1),
      follow.following(userId, 1),
    ])
    profile.value.followers_count = followersData.total || 0
    profile.value.following_count = followingData.total || 0
  } catch (e) {
    // Counts stay at 0
  }
}

// ─── API: Check follow status ────────────────────────────
async function checkFollowStatus(userId) {
  try {
    const data = await follow.isFollowing(userId)
    isWatching.value = data.is_following
  } catch {
    isWatching.value = false
  }
}

// ─── API: Toggle follow ──────────────────────────────────
async function toggleWatch() {
  if (!profile.value.id || isOwnProfile.value) return

  try {
    if (isWatching.value) {
      await follow.unfollow(profile.value.id)
      isWatching.value = false
      profile.value.followers_count = Math.max(0, profile.value.followers_count - 1)
    } else {
      await follow.follow(profile.value.id)
      isWatching.value = true
      profile.value.followers_count++
    }
  } catch (e) {
    console.error('Follow/unfollow failed:', e)
  }
}

// ─── Helpers ─────────────────────────────────────────────
function timeAgo(dateStr) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const seconds = Math.floor((now - then) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// ─── Counter animation ────────────────────────────────────
function animateCounter(target, setter, duration = 1200) {
  if (!target) { setter(0); return }
  const start = performance.now()
  const update = (now) => {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    setter(Math.floor(eased * target))
    if (progress < 1) requestAnimationFrame(update)
    else setter(target)
  }
  requestAnimationFrame(update)
}

// ─── Intersection Observer for stats ─────────────────────
let statsObserver = null

function initStatsObserver() {
  const el = document.getElementById('stats-section')
  if (!el) return
  statsObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !statsAnimated.value) {
      statsAnimated.value = true
      animateCounter(profile.value.followers_count, v => animatedWatchers.value = v)
      animateCounter(profile.value.posts_count, v => animatedDeviations.value = v, 1000)
      animateCounter(profile.value.following_count, v => animatedViews.value = v, 1500)
      statsObserver?.disconnect()
    }
  }, { threshold: 0.3 })
  statsObserver.observe(el)
}

// ─── Staggered mount animations ──────────────────────────
let scrollHandler = null

onMounted(async () => {
  setTimeout(() => { showBanner.value = true }, 100)
  setTimeout(() => { showAvatar.value = true }, 250)
  setTimeout(() => { showMeta.value = true }, 380)
  setTimeout(() => { showSidebar.value = true }, 450)

  await loadProfile()

  setTimeout(() => { isLoading.value = false }, 200)
  setTimeout(() => { showStats.value = true; initStatsObserver() }, 300)
  setTimeout(() => { showTabs.value = true }, 400)
  setTimeout(() => { showGrid.value = true }, 500)

  // Scroll-based header
  scrollHandler = () => { headerVisible.value = window.scrollY > 200 }
  window.addEventListener('scroll', scrollHandler)
})

onUnmounted(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
  statsObserver?.disconnect()
})

// Re-load when route changes (e.g. navigating to another user's profile)
watch(profileUsername, () => {
  statsAnimated.value = false
  loadProfile()
})



// ─── Avatar Upload ──────────────────────────────────────
function triggerAvatarUpload() {
  avatarInput.value?.click()
}

async function handleAvatarChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    showToast('Please select a JPEG, PNG, or WebP image.', 'error')
    return
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showToast('Image must be under 2 MB.', 'error')
    return
  }

  // Show preview immediately
  avatarPreview.value = URL.createObjectURL(file)

  avatarUploading.value = true
  try {
    const updatedUser = await users.uploadAvatar(file)
    profile.value.avatar_url = updatedUser.avatar_url
    avatarPreview.value = null

    // Update auth user in localStorage
    await hydrateAuthState()

    showToast('Profile picture updated!', 'success')
  } catch (e) {
    console.error('Avatar upload failed:', e)
    avatarPreview.value = null
    showToast('Failed to upload avatar. Please try again.', 'error')
  } finally {
    avatarUploading.value = false
    // Reset file input so the same file can be re-selected
    if (avatarInput.value) avatarInput.value.value = ''
  }
}

// ─── Bio Edit ───────────────────────────────────────────
function openEditModal() {
  editBio.value = profile.value.bio || ''
  showEditModal.value = true
  nextTick(() => {
    const textarea = document.getElementById('bio-textarea')
    if (textarea) textarea.focus()
  })
}

function closeEditModal() {
  showEditModal.value = false
}

async function saveBio() {
  bioSaving.value = true
  try {
    const updatedUser = await users.updateProfile({ bio: editBio.value || null })
    profile.value.bio = updatedUser.bio || ''

    // Save bio locally as JSON
    saveBioLocally(profile.value.username, editBio.value)

    // Update auth user in localStorage
    await hydrateAuthState()

    showEditModal.value = false
    showToast('Bio saved successfully!', 'success')
  } catch (e) {
    console.error('Failed to save bio:', e)
    showToast('Failed to save bio. Please try again.', 'error')
  } finally {
    bioSaving.value = false
  }
}

// ─── Local Bio Storage (JSON) ───────────────────────────
function saveBioLocally(username, bio) {
  const stored = JSON.parse(localStorage.getItem('instaclone_bios') || '{}')
  stored[username] = {
    bio,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem('instaclone_bios', JSON.stringify(stored))
}

function getLocalBio(username) {
  const stored = JSON.parse(localStorage.getItem('instaclone_bios') || '{}')
  return stored[username] || null
}

// ─── Toast ──────────────────────────────────────────────
function showToast(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
  }, 3000)
}
</script>

<template>
  <div>
  <div class="profile-root bg-dark min-h-screen text-white overflow-x-hidden">

    <!-- Hidden avatar file input -->
    <input
      ref="avatarInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp"
      class="hidden"
      @change="handleAvatarChange"
    />

    <!-- ── Toast Notification ── -->
    <Transition name="toast">
      <div v-if="toastVisible"
        class="toast-notification fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5
          rounded-xl border backdrop-blur-xl shadow-2xl"
        :class="toastType === 'success'
          ? 'bg-primary/15 border-primary/40 text-primary'
          : 'bg-red-500/15 border-red-500/40 text-red-400'">
        <i class="bi text-lg" :class="toastType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
        <span class="text-sm font-bold tracking-wide">{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- ── PROFILE HEADER (Extracted) ── -->
    <ProfileHeader
      :profile="profile"
      :is-own-profile="isOwnProfile"
      :is-watching="isWatching"
      :show-banner="showBanner"
      :show-avatar="showAvatar"
      :show-meta="showMeta"
      :header-visible="headerVisible"
      :avatar-preview="avatarPreview"
      :avatar-uploading="avatarUploading"
      @toggle-watch="toggleWatch"
      @trigger-avatar-upload="triggerAvatarUpload"
      @edit-profile="showEditModal = true"
    />

    <!-- ── STATS BAR (Extracted) ── -->
    <ProfileStats
      :profile="profile"
      :show-stats="showStats"
      :animated-watchers="animatedWatchers"
      :animated-deviations="animatedDeviations"
      :animated-views="animatedViews"
      @navigate="(link) => $router.push(`/profile/list/${link}?userId=${profile.id}`)"
    />

    <!-- ── MAIN CONTENT ── -->
    <div class="flex gap-0 md:gap-8 px-0 md:px-10 mt-8 pb-20">

      <!-- ── SIDEBAR (desktop only) ── -->
      <aside class="hidden md:flex flex-col gap-5 w-72 flex-shrink-0 transition-all duration-700"
        :class="showSidebar ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'">

        <!-- About card -->
        <div class="glass-card rounded-xl border border-border bg-surface/60 p-5">
          <div class="flex items-center gap-2 mb-3">
            <i class="bi bi-info-circle text-primary text-lg"></i>
            <h3 class="text-xs font-black tracking-widest text-white/60">ABOUT</h3>
          </div>
          <p class="text-sm text-white/55 leading-relaxed mb-5">{{ profile.bio || 'No bio yet.' }}</p>

          <div class="flex flex-col gap-3 text-xs">
            <div class="flex justify-between">
              <span class="text-white/30 font-bold tracking-wider">JOINED</span>
              <span class="text-white/70 font-bold">{{ formattedJoinDate }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/30 font-bold tracking-wider">POSTS</span>
              <span class="text-white/70 font-bold">{{ profile.posts_count }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/30 font-bold tracking-wider">FOLLOWERS</span>
              <span class="text-white/70 font-bold">{{ profile.followers_count }}</span>
            </div>
          </div>
        </div>

        <!-- Activity card -->
        <div class="glass-card rounded-xl border border-border bg-surface/60 p-5">
          <div class="flex items-center gap-2 mb-4">
            <i class="bi bi-graph-up text-primary text-lg"></i>
            <h3 class="text-xs font-black tracking-widest text-white/60">ACTIVITY</h3>
          </div>
          <div class="flex flex-col gap-4">
            <div v-for="(act, i) in activity" :key="i"
              class="activity-row flex items-start gap-3 group"
              :style="{ animationDelay: (i * 100 + 500) + 'ms' }">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                :style="{ background: act.color + '18', border: '1px solid ' + act.color + '30' }">
                <i class="bi text-sm"
                  :class="'bi-' + act.icon"
                  :style="{ color: act.color }"></i>
              </div>
              <div>
                <p class="text-xs text-white/60">
                  {{ act.label }}
                  <span class="font-bold text-primary cursor-pointer hover:underline">{{ act.link }}</span>
                </p>
                <p class="text-xs text-white/25 mt-0.5">{{ act.time }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Go Premium -->
        <div v-if="isOwnProfile"
          class="premium-card rounded-xl p-5 relative overflow-hidden cursor-pointer
            border border-primary/30 hover:border-primary/60 transition-all duration-300 group">
          <div class="premium-bg absolute inset-0"></div>
          <div class="relative z-10 flex items-center gap-3">
            <i class="bi bi-lightning-fill text-primary text-2xl"></i>
            <div>
              <p class="text-sm font-black text-white tracking-wider">Go Premium</p>
              <p class="text-xs text-white/40">Unlock advanced creator tools</p>
            </div>
            <i class="bi bi-chevron-right text-white/30 ml-auto group-hover:text-white/60 transition-colors"></i>
          </div>
        </div>
      </aside>

      <!-- ── MAIN COLUMN ── -->
      <main class="flex-1 min-w-0 px-6 md:px-0">

        <!-- TABS (Extracted) -->
        <ProfileTabs
          :tabs="tabs"
          v-model:activeTab="activeTab"
          :show-tabs="showTabs"
        />

        <!-- GALLERY GRID -->
        <Transition name="fade-up" mode="out-in">
          <div v-if="activeTab === 'recent'" key="recent">
            <ProfileGrid
              :gallery-items="galleryItems"
              :posts-loading="postsLoading"
              :show-grid="showGrid"
              :is-own-profile="isOwnProfile"
              :posts-page="postsPage"
              :posts-last-page="postsLastPage"
              @navigate="(path) => $router.push(path)"
              @load-more="loadMorePosts"
            />
          </div>

          <!-- COLLECTIONS tab -->
          <div v-else-if="activeTab === 'collections'" key="collections" class="fade-up-enter-active">
            <div class="flex flex-col items-center justify-center py-24 text-center">
              <i class="bi bi-collection text-white/10 mb-4" style="font-size: 4rem"></i>
              <p class="text-white/30 font-bold tracking-widest text-sm">NO COLLECTIONS YET</p>
              <p class="text-white/20 text-xs mt-1">Start curating your work into collections</p>
            </div>
          </div>

          <!-- ABOUT tab -->
          <div v-else-if="activeTab === 'about'" key="about" class="fade-up-enter-active">
            <div class="glass-card rounded-xl border border-border bg-surface/60 p-6 max-w-xl">
              <!-- Bio section with inline edit -->
              <div class="flex items-start justify-between mb-6">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="bi bi-text-left text-primary text-sm"></i>
                    <span class="text-white/25 font-bold tracking-wider text-xs">BIO</span>
                  </div>
                  <p class="text-white/60 leading-relaxed">{{ profile.bio || 'No bio yet.' }}</p>
                </div>
                <button v-if="isOwnProfile" @click="openEditModal"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider
                    text-primary/70 hover:text-primary bg-primary/5 hover:bg-primary/10
                    border border-primary/20 hover:border-primary/40
                    transition-all duration-200 flex-shrink-0 ml-4">
                  <i class="bi bi-pencil text-sm"></i>
                  EDIT
                </button>
              </div>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-white/25 font-bold tracking-wider text-xs mb-1">JOINED</p>
                  <p class="text-white/70 font-bold">{{ formattedJoinDate }}</p>
                </div>
                <div>
                  <p class="text-white/25 font-bold tracking-wider text-xs mb-1">USERNAME</p>
                  <p class="text-white/70 font-bold">@{{ profile.username }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-white/25 font-bold tracking-wider text-xs mb-2">NAME</p>
                  <div class="flex gap-2">
                    <span class="px-3 py-1 text-xs font-bold border border-border rounded-full text-white/50">
                      {{ profile.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>


      </main>
    </div>

    <!-- ── EDIT PROFILE MODAL (Extracted) ── -->
    <EditProfileModal
      :show-edit-modal="showEditModal"
      :profile="profile"
      :avatar-preview="avatarPreview"
      :avatar-uploading="avatarUploading"
      :bio-saving="bioSaving"
      :initial-bio="editBio"
      @close="closeEditModal"
      @save="(bio) => { editBio = bio; saveBio() }"
      @trigger-avatar-upload="triggerAvatarUpload"
    />
  </div>
  </div>
</template>

<style scoped>
/* ─── Tailwind-compatible custom properties ─── */
.profile-root {
  font-family: 'Inter', sans-serif;
}

/* ─── Beam animations (banner) ─── */
.beam {
  position: absolute;
  pointer-events: none;
  border-radius: 100%;
  filter: blur(40px);
}

.beam-1 {
  width: 600px; height: 200px;
  background: linear-gradient(90deg, transparent, rgba(5, 204, 71, 0.15), transparent);
  top: 30%; left: -100px;
  transform: rotate(-15deg);
  animation: beam-sweep 8s ease-in-out infinite;
}

.beam-2 {
  width: 400px; height: 150px;
  background: linear-gradient(90deg, transparent, rgba(0, 120, 255, 0.1), transparent);
  top: 60%; right: -50px;
  transform: rotate(10deg);
  animation: beam-sweep 10s ease-in-out infinite 2s;
}

.beam-3 {
  width: 300px; height: 100px;
  background: linear-gradient(90deg, transparent, rgba(5, 204, 71, 0.08), transparent);
  top: 10%; left: 40%;
  animation: beam-sweep 12s ease-in-out infinite 4s;
}

@keyframes beam-sweep {
  0%, 100% { transform: translateX(-30px) rotate(-15deg); opacity: 0.5; }
  50% { transform: translateX(30px) rotate(-15deg); opacity: 1; }
}

.scanlines {
  background: repeating-linear-gradient(
    to bottom,
    transparent, transparent 2px,
    rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px
  );
}

/* ─── Banner entrance ─── */
.banner-out { opacity: 0; transform: scaleY(0.92); filter: blur(4px); transition: none; }
.banner-in {
  opacity: 1; transform: scaleY(1); filter: blur(0);
  transition: opacity 0.7s ease, transform 0.7s ease, filter 0.7s ease;
}

/* ─── Avatar entrance ─── */
.avatar-out { opacity: 0; transform: translateY(20px) scale(0.9); transition: none; }
.avatar-in {
  opacity: 1; transform: translateY(0) scale(1);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ─── Meta entrance ─── */
.meta-out { opacity: 0; transform: translateX(-16px); transition: none; }
.meta-in {
  opacity: 1; transform: translateX(0);
  transition: all 0.5s ease;
}

/* ─── Avatar glow ─── */
.avatar-glow {
  background: conic-gradient(from 0deg, #05cc47, transparent, #05cc47, transparent, #05cc47);
  border-radius: 14px;
  animation: rotate-glow 4s linear infinite;
  opacity: 0.5;
}

@keyframes rotate-glow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.avatar-shimmer {
  background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%);
  background-size: 200% 200%;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { background-position: 200% 200%; }
  50% { background-position: 0% 0%; }
}

/* ─── Profile name ─── */
.profile-name {
  background: linear-gradient(135deg, #ffffff 60%, rgba(255,255,255,0.6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

/* ─── Pulse dot ─── */
.pulse-dot {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(5, 204, 71, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(5, 204, 71, 0); }
}

/* ─── Watch button glow ─── */
.watch-glow {
  box-shadow: 0 0 20px rgba(5, 204, 71, 0.3);
}

.watch-glow:hover {
  box-shadow: 0 0 30px rgba(5, 204, 71, 0.5);
}

/* ─── Art Grid ─── */
.art-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: auto;
  gap: 8px;
}

.art-large { grid-column: span 4; grid-row: span 2; min-height: 320px; }
.art-tall  { grid-column: span 2; grid-row: span 2; min-height: 320px; }
.art-wide  { grid-column: span 4; grid-row: span 1; min-height: 160px; }
.art-normal{ grid-column: span 2; grid-row: span 1; min-height: 160px; }

/* Grid entrance */
.grid-out .art-cell { opacity: 0; transform: translateY(20px); }
.grid-in .art-cell {
  animation: cell-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes cell-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Art cell internals */
.art-bg { transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); }

.art-inner-glow {
  background: radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.06) 0%, transparent 60%);
}

.art-grid-tex {
  background-image: 
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 32px 32px;
}

/* ─── Premium card ─── */
.premium-bg {
  background: linear-gradient(135deg, rgba(5,204,71,0.08) 0%, rgba(5,204,71,0.02) 100%);
}

/* ─── Comment input ─── */
.comment-input { font-family: 'Inter', sans-serif; }

/* ─── Comment list transition ─── */
.comment-list-enter-active { transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.comment-list-enter-from { opacity: 0; transform: translateY(-12px); }

/* ─── Fade-up transition ─── */
.fade-up-enter-active { animation: fade-up-anim 0.35s ease both; }
.fade-up-leave-active { animation: fade-up-anim 0.2s ease reverse both; }

@keyframes fade-up-anim {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ─── Slide-down for sticky header ─── */
.slide-down-enter-active { transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from { opacity: 0; transform: translateY(-100%); }
.slide-down-leave-to { opacity: 0; transform: translateY(-100%); }

/* ─── Load more ─── */
.load-more {
  background: rgba(255,255,255,0.015);
}
.load-more:hover {
  background: rgba(5, 204, 71, 0.03);
}

/* ─── Mobile responsive ─── */
@media (max-width: 768px) {
  .art-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .art-large { grid-column: span 2; grid-row: span 1; min-height: 220px; }
  .art-tall  { grid-column: span 1; grid-row: span 1; min-height: 180px; }
  .art-wide  { grid-column: span 2; min-height: 140px; }
  .art-normal{ grid-column: span 1; min-height: 140px; }
}

/* ─── Tabular nums for counter ─── */
.tabular-nums { font-variant-numeric: tabular-nums; }

/* ─── Avatar camera overlay ─── */
.avatar-camera-overlay {
  cursor: pointer;
}

/* ─── Edit Modal ─── */
.edit-modal {
  animation: modal-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-pop {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(12px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-enter-active {
  transition: opacity 0.3s ease;
}
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-leave-to .edit-modal {
  transform: scale(0.95);
  opacity: 0;
}

/* ─── Bio input ─── */
.bio-input {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
}
.bio-input:focus {
  box-shadow: 0 0 0 3px rgba(5, 204, 71, 0.1);
}

/* ─── Toast notification ─── */
.toast-notification {
  animation: toast-slide 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes toast-slide {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>