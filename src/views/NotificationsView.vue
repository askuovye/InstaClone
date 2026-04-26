<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'
import { timeAgo } from '../utils/dates'
import { notifications as notifApi, follow as followApi } from '../services/api'


const router = useRouter()
const authStore = useAuthStore()
const { user: authUser } = storeToRefs(authStore)

// ─── State ────────────────────────────────────────────────
const activeFilter = ref('all')
const headerIn = ref(false)
const contentIn = ref(false)

const allNotifications = ref([])
const isLoading = ref(true)
const loadError = ref(null)
const unreadCount = ref(0)
const currentPage = ref(1)
const hasMore = ref(true)
const loadingMore = ref(false)
const markingRead = ref(false)

// Follow-back state: userId -> true/false
const followBackMap = ref({})

// ─── Filters ──────────────────────────────────────────────
const filters = [
  { key: 'all',     label: 'All' },
  { key: 'like',    label: 'Likes' },
  { key: 'comment', label: 'Comments' },
  { key: 'follow',  label: 'Follows' },
]

// ─── Icon + color per notification type ───────────────────
const typeConfig = {
  like:    { icon: 'favorite',    label: 'liked your post' },
  comment: { icon: 'chat_bubble', label: 'commented on your post' },
  follow:  { icon: 'person_add',  label: 'started following you' },
}

// ─── Derived ──────────────────────────────────────────────
const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') return allNotifications.value
  return allNotifications.value.filter(n => n.type === activeFilter.value)
})

// Group notifications: "NEW" (unread) and "EARLIER" (read)
const groupedNotifications = computed(() => {
  const filtered = filteredNotifications.value
  const unread = filtered.filter(n => !n.read_at)
  const read = filtered.filter(n => n.read_at)

  const groups = []
  if (unread.length > 0) groups.push({ label: 'NEW', items: unread })
  if (read.length > 0) groups.push({ label: 'EARLIER', items: read })
  return groups
})

// ─── Load notifications ───────────────────────────────────
async function loadNotifications(append = false) {
  if (!append) {
    isLoading.value = true
    currentPage.value = 1
  } else {
    loadingMore.value = true
  }
  loadError.value = null

  try {
    const data = await notifApi.list({ page: currentPage.value, per_page: 20 })
    const items = Array.isArray(data.data) ? data.data : []

    if (append) {
      allNotifications.value.push(...items)
    } else {
      allNotifications.value = items
    }

    hasMore.value = !!data.next_page_url
    if (hasMore.value) currentPage.value++
  } catch (e) {
    console.error('Notifications load failed:', e)
    loadError.value = e.message || 'Failed to load notifications'
  } finally {
    isLoading.value = false
    loadingMore.value = false
    setTimeout(() => { contentIn.value = true }, 150)
  }
}

async function fetchUnreadCount() {
  try {
    const data = await notifApi.unreadCount()
    unreadCount.value = data.unread_count || 0
  } catch { /* ignore */ }
}

// ─── Mark all read ────────────────────────────────────────
async function markAllRead() {
  markingRead.value = true
  try {
    await notifApi.markAllRead()
    allNotifications.value.forEach(n => {
      n.read_at = new Date().toISOString()
    })
    unreadCount.value = 0
  } catch (e) {
    console.error('Mark all read failed:', e)
  } finally {
    markingRead.value = false
  }
}

// ─── Follow back ──────────────────────────────────────────
async function toggleFollowBack(actorId) {
  const wasFollowing = followBackMap.value[actorId]
  followBackMap.value[actorId] = !wasFollowing

  try {
    if (wasFollowing) {
      await followApi.unfollow(actorId)
    } else {
      await followApi.follow(actorId)
    }
  } catch {
    followBackMap.value[actorId] = wasFollowing
  }
}

// ─── Time formatting ──────────────────────────────────────
// Local timeAgo is now imported from utils/dates.js

// ─── Navigate ─────────────────────────────────────────────
function goToProfile(username) {
  if (username) router.push(`/profile/${username}`)
}

// ─── Lifecycle ────────────────────────────────────────────
onMounted(async () => {
  setTimeout(() => { headerIn.value = true }, 80)
  await Promise.all([loadNotifications(), fetchUnreadCount()])
})
</script>

<template>
  <div>
    <div class="notifications-page max-w-3xl w-full px-4 md:px-10 pb-8">

      <!-- ── Page Header ── -->
      <div class="py-6 md:py-8 transition-all duration-600"
        :class="headerIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'">

        <div class="flex items-start justify-between mb-1">
          <div>
            <h1 class="page-title text-2xl md:text-3xl font-black text-white tracking-tight">
              Notifications
            </h1>
            <p class="text-sm text-white/35 mt-1">
              <template v-if="unreadCount > 0">
                You have
                <span class="text-primary font-bold">{{ unreadCount }} new update{{ unreadCount !== 1 ? 's' : '' }}</span>
              </template>
              <template v-else>
                You're all caught up
              </template>
            </p>
          </div>
          <button @click="markAllRead" :disabled="markingRead || unreadCount === 0"
            class="px-4 py-2 text-xs font-black tracking-widest text-white/50 rounded-xl
              border border-border transition-all duration-200
              hover:text-white hover:bg-white/5
              disabled:opacity-30 disabled:cursor-not-allowed">
            {{ markingRead ? 'Marking...' : 'Mark all read' }}
          </button>
        </div>

        <!-- Filter tabs -->
        <div class="flex gap-1 mt-4 md:mt-6 overflow-x-auto hide-scrollbar">
          <button v-for="f in filters" :key="f.key"
            @click="activeFilter = f.key"
            class="filter-tab px-4 py-2 rounded-lg text-sm font-black tracking-wide
              transition-all duration-200 flex-shrink-0"
            :class="activeFilter === f.key
              ? 'bg-primary text-black'
              : 'text-white/40 hover:text-white hover:bg-white/5 border border-border'">
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- ── Loading ── -->
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="flex items-start gap-4 p-4 rounded-2xl animate-pulse"
          style="background: rgba(255,255,255,0.03); border: 1px solid rgba(227,225,235,0.07);">
          <div class="w-12 h-12 rounded-xl bg-surface flex-shrink-0"></div>
          <div class="flex-1 space-y-2 pt-1">
            <div class="h-3 bg-surface rounded w-3/4"></div>
            <div class="h-2.5 bg-surface rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- ── Error ── -->
      <div v-else-if="loadError"
        class="flex flex-col items-center justify-center py-24 text-center">
        <span class="material-symbols-rounded icon-filled text-red-400/30 mb-4" style="font-size: 3rem">error</span>
        <p class="text-white/40 font-bold tracking-wider text-sm mb-4">{{ loadError }}</p>
        <button @click="loadNotifications()"
          class="px-5 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg
            text-xs font-black tracking-widest hover:bg-primary/20 transition-all">
          TRY AGAIN
        </button>
      </div>

      <!-- ── Empty ── -->
      <div v-else-if="allNotifications.length === 0"
        class="flex flex-col items-center justify-center py-24 text-center">
        <div class="w-16 h-16 rounded-2xl bg-surface border border-border
          flex items-center justify-center mb-4">
          <span class="material-symbols-rounded text-white/15 text-3xl">notifications_off</span>
        </div>
        <p class="text-sm font-black tracking-widest text-white/25">NO NOTIFICATIONS YET</p>
        <p class="text-xs text-white/15 mt-1">Interact with posts and users to receive notifications</p>
      </div>

      <!-- ── Notification Groups ── -->
      <div v-else class="space-y-8 transition-all duration-500"
        :class="contentIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">

        <!-- Filtered empty state -->
        <div v-if="filteredNotifications.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-14 h-14 rounded-2xl bg-surface border border-border
            flex items-center justify-center mb-3">
            <span class="material-symbols-rounded text-white/15 text-2xl">filter_list_off</span>
          </div>
          <p class="text-xs font-black tracking-widest text-white/25">NO {{ activeFilter.toUpperCase() }} NOTIFICATIONS</p>
        </div>

        <!-- Groups -->
        <TransitionGroup v-else name="group-fade" tag="div" class="space-y-8">
          <div v-for="(group, gi) in groupedNotifications" :key="group.label"
            :style="{ animationDelay: (gi * 80) + 'ms' }">

            <!-- Group label -->
            <p class="text-xs font-black tracking-widest text-white/25 mb-3 px-1">
              {{ group.label }}
              <span v-if="group.label === 'NEW'"
                class="inline-flex items-center justify-center ml-2 px-2 py-0.5
                  bg-primary/15 text-primary text-[10px] font-black rounded-full">
                {{ group.items.length }}
              </span>
            </p>

            <!-- Items -->
            <TransitionGroup name="item-fade" tag="div" class="space-y-2">
              <div v-for="(notif, ni) in group.items" :key="notif.id"
                class="notif-card relative overflow-hidden rounded-2xl cursor-pointer
                  transition-all duration-300 group"
                :class="notif.read_at ? '' : 'notif-unread'"
                :style="{
                  background: 'rgba(255,255,255,0.03)',
                  border: notif.read_at
                    ? '1px solid rgba(227,225,235,0.07)'
                    : '1px solid rgba(5,204,71,0.15)',
                  animationDelay: (ni * 60 + gi * 100) + 'ms',
                }">

                <!-- Unread accent bar -->
                <div v-if="!notif.read_at"
                  class="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                  style="background: #05cc47; box-shadow: 0 0 8px rgba(5,204,71,0.6);"></div>

                <!-- Hover glow -->
                <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style="background: radial-gradient(ellipse at 20% 50%, rgba(5,204,71,0.04) 0%, transparent 70%);"></div>

                <div class="flex items-start gap-4 p-4 pl-5">

                  <!-- Avatar + type badge -->
                  <div class="relative flex-shrink-0">
                    <div class="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center
                      bg-surface border border-border"
                      @click.stop="goToProfile(notif.actor?.username)">
                      <img v-if="notif.actor?.avatar_url" :src="notif.actor.avatar_url"
                        class="w-full h-full object-cover" />
                      <span v-else class="material-symbols-rounded icon-filled text-white/25 text-2xl">person</span>
                    </div>
                    <!-- Type badge -->
                    <div class="absolute -bottom-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                      style="background: #05cc47; border: 2px solid #0d0e14;">
                      <span class="material-symbols-rounded icon-filled text-black" style="font-size: 12px;">
                        {{ typeConfig[notif.type]?.icon || 'notifications' }}
                      </span>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm leading-relaxed text-white/75">
                      <span class="font-black text-white cursor-pointer hover:text-primary transition-colors"
                        @click.stop="goToProfile(notif.actor?.username)">
                        {{ notif.actor?.username || notif.actor?.name || 'Someone' }}
                      </span>
                      {{ ' ' }}{{ typeConfig[notif.type]?.label || 'interacted with you' }}
                    </p>

                    <!-- Comment body (for comment type) -->
                    <p v-if="notif.type === 'comment' && notif.data?.comment_body"
                      class="mt-1.5 text-sm italic text-white/40 leading-relaxed line-clamp-2">
                      "{{ notif.data.comment_body }}"
                    </p>

                    <!-- Time -->
                    <p class="text-xs font-bold tracking-wider text-white/25 mt-2">
                      {{ timeAgo(notif.created_at) }}
                    </p>

                    <!-- Follow-back CTA (for follow type) -->
                    <div v-if="notif.type === 'follow' && notif.data?.actor_id" class="mt-3">
                      <button
                        @click.stop="toggleFollowBack(notif.data.actor_id)"
                        class="px-4 py-1.5 text-xs font-black tracking-widest rounded-lg
                          transition-all duration-200"
                        :class="followBackMap[notif.data.actor_id]
                          ? 'bg-primary/10 border border-primary/30 text-primary'
                          : 'bg-surface border border-border text-white/60 hover:border-primary/30 hover:text-primary'">
                        {{ followBackMap[notif.data.actor_id] ? '✓ FOLLOWING' : 'FOLLOW BACK' }}
                      </button>
                    </div>
                  </div>

                  <!-- Right: time + thumbnail -->
                  <div class="flex flex-col items-end gap-2 flex-shrink-0">
                    <span class="text-xs font-bold text-white/20 whitespace-nowrap">
                      {{ timeAgo(notif.created_at) }}
                    </span>

                    <!-- Post thumbnail for like/comment -->
                    <div v-if="notif.type !== 'follow' && notif.data?.post_id"
                      class="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface border border-border
                        transition-transform duration-300 group-hover:scale-105">
                      <!-- Placeholder gradient since we don't have the post image in the notification -->
                      <div class="w-full h-full relative"
                        style="background: linear-gradient(135deg, rgba(5,204,71,0.05), rgba(5,204,71,0.15));">
                        <div class="scanlines absolute inset-0 opacity-20"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                          <span class="material-symbols-rounded text-primary/30 text-lg">image</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </TransitionGroup>

        <!-- Load more -->
        <div v-if="hasMore && filteredNotifications.length > 0" class="flex justify-center pt-4 pb-8">
          <button @click="loadNotifications(true)" :disabled="loadingMore"
            class="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black tracking-widest
              text-white/40 border border-border transition-all duration-300
              hover:text-white/70 hover:bg-white/5
              disabled:opacity-40">
            <span v-if="loadingMore" class="material-symbols-rounded text-sm animate-spin">autorenew</span>
            {{ loadingMore ? 'Loading...' : 'Load More' }}
            <span v-if="!loadingMore" class="material-symbols-rounded text-xl">expand_more</span>
          </button>
        </div>

        <!-- All caught up -->
        <div v-if="!hasMore && filteredNotifications.length > 0" class="flex flex-col items-center py-6 text-center">
          <span class="material-symbols-rounded icon-filled text-white/10 mb-2" style="font-size: 1.5rem">check_circle</span>
          <p class="text-white/20 text-xs font-bold tracking-widest">THAT'S EVERYTHING</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-page { font-family: 'Inter', sans-serif; }

/* ─── Page title ─── */
.page-title {
  background: linear-gradient(135deg, #fff 50%, rgba(255,255,255,0.5) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ─── Unread card entrance ─── */
.notif-unread {
  animation: card-in 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes card-in {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ─── Group fade ─── */
.group-fade-enter-active { transition: all 0.4s ease; }
.group-fade-enter-from   { opacity: 0; transform: translateY(10px); }

/* ─── Item fade ─── */
.item-fade-enter-active { transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.item-fade-enter-from   { opacity: 0; transform: translateX(-8px); }
.item-fade-leave-active { transition: all 0.25s ease; }
.item-fade-leave-to     { opacity: 0; transform: translateX(8px); }

/* ─── Card hover ─── */
.notif-card:hover {
  border-color: rgba(5, 204, 71, 0.2) !important;
  transform: translateX(2px);
}

/* ─── Scanlines ─── */
.scanlines {
  background: repeating-linear-gradient(
    to bottom, transparent, transparent 2px,
    rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px
  );
}

/* ─── Filter tab ─── */
.filter-tab { white-space: nowrap; }

/* ─── Hide scrollbar ─── */
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* ─── Line clamp ─── */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ─── Skeleton pulse ─── */
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.7; }
}
.animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
</style>