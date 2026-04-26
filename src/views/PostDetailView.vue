<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { posts as postsApi, likes as likesApi } from '../services/api'
import PostCommentList from '../components/post/PostCommentList.vue'

const route  = useRoute()
const router = useRouter()

const post    = ref(null)
const loading = ref(true)
const error   = ref('')
const saved   = ref(false)
const imgLoaded = ref(false)
const panelIn   = ref(false)
const imageIn   = ref(false)

async function loadPost() {
  loading.value = true
  try {
    post.value = await postsApi.get(route.params.postId)
  } catch (e) {
    error.value = 'Failed to load post'
  } finally {
    loading.value = false
    setTimeout(() => { imageIn.value = true }, 80)
    setTimeout(() => { panelIn.value = true }, 200)
  }
}

async function toggleLike() {
  if (!post.value) return
  const wasLiked = post.value.liked_by_me
  post.value.liked_by_me = !wasLiked
  post.value.likes_count += wasLiked ? -1 : 1
  try {
    if (wasLiked) await likesApi.unlike(post.value.id)
    else          await likesApi.like(post.value.id)
  } catch {
    post.value.liked_by_me = wasLiked
    post.value.likes_count += wasLiked ? 1 : -1
  }
}

function formatCount(n) {
  if (!n) return '0'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

onMounted(loadPost)
</script>

<template>
  <div class="post-view-root min-h-screen" style="background: #0d0e14;">

    <!-- ── Back button ── -->
    <div class="px-4 md:px-10 pt-5 pb-3">
      <button @click="$router.back()"
        class="back-btn group flex items-center gap-2.5 text-xs font-black tracking-widest
          text-white/30 hover:text-white transition-all duration-200 w-fit">
        <span class="w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-200
          group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:text-primary"
          style="background: rgba(255,255,255,0.04); border-color: rgba(227,225,235,0.1);">
          <i class="bi bi-arrow-left text-sm"></i>
        </span>
        <span class="group-hover:translate-x-0.5 transition-transform duration-200">BACK</span>
      </button>
    </div>

    <!-- ── Loading skeleton ── -->
    <div v-if="loading" class="px-4 md:px-10 pb-10">
      <div class="flex flex-col md:flex-row gap-0 rounded-3xl overflow-hidden border border-white/[0.06]"
        style="background: rgba(255,255,255,0.02);">
        <div class="flex-1 min-h-[60vw] md:min-h-[70vh] animate-pulse rounded-l-none"
          style="background: rgba(255,255,255,0.04);"></div>
        <div class="w-full md:w-[380px] p-6 flex flex-col gap-4">
          <div class="flex gap-3 items-center">
            <div class="w-10 h-10 rounded-xl animate-pulse" style="background: rgba(255,255,255,0.06);"></div>
            <div class="h-4 w-32 rounded-lg animate-pulse" style="background: rgba(255,255,255,0.06);"></div>
          </div>
          <div class="space-y-2.5 mt-4">
            <div v-for="i in 4" :key="i"
              class="h-3 rounded-lg animate-pulse"
              :style="{ width: [90,75,85,60][i-1]+'%', background: 'rgba(255,255,255,0.05)' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error"
      class="flex flex-col items-center justify-center py-32 text-center px-4">
      <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style="background: rgba(220,50,50,0.08); border: 1px solid rgba(220,50,50,0.2);">
        <i class="bi bi-exclamation-triangle text-2xl" style="color: #ff6b6b;"></i>
      </div>
      <p class="text-sm font-black tracking-widest" style="color: #ff6b6b;">{{ error.toUpperCase() }}</p>
      <button @click="loadPost"
        class="mt-4 px-5 py-2 rounded-xl text-xs font-black tracking-widest text-white/50
          hover:text-white transition-all duration-200"
        style="border: 1px solid rgba(227,225,235,0.12); background: rgba(255,255,255,0.03);">
        RETRY
      </button>
    </div>

    <!-- ── Post ── -->
    <div v-else-if="post"
      class="px-4 md:px-10 pb-10">

      <div class="post-shell flex flex-col md:flex-row gap-0 rounded-3xl overflow-hidden
        border border-white/[0.07]"
        style="background: rgba(255,255,255,0.015);">

        <!-- ═══ LEFT: Image ═══ -->
        <div class="image-panel flex-1 relative flex items-center justify-center overflow-hidden"
          style="background: #000; min-height: 50vw;"
          :class="imageIn ? 'image-in' : 'image-out'">

          <!-- Ambient glow behind image -->
          <div class="ambient-glow absolute inset-0 pointer-events-none"></div>

          <!-- Scanlines overlay -->
          <div class="scanlines absolute inset-0 pointer-events-none z-10 opacity-10"></div>

          <!-- Corner accents -->
          <div class="corner-tl absolute top-3 left-3 z-20">
            <div class="w-5 h-px bg-primary/50"></div>
            <div class="w-px h-5 bg-primary/50 mt-0"></div>
          </div>
          <div class="corner-br absolute bottom-3 right-3 z-20 flex flex-col items-end">
            <div class="w-px h-5 bg-primary/50"></div>
            <div class="w-5 h-px bg-primary/50"></div>
          </div>

          <img
            :src="post.image_url"
            class="relative z-10 w-full h-full object-contain transition-all duration-700"
            :class="imgLoaded ? 'img-reveal' : 'opacity-0'"
            style="max-height: 85vh;"
            @load="imgLoaded = true"
          />

          <!-- Bottom gradient fade -->
          <div class="absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none"
            style="background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);"></div>
        </div>

        <!-- ═══ RIGHT: Panel ═══ -->
        <div class="side-panel w-full md:w-[370px] lg:w-[420px] flex flex-col border-t md:border-t-0 md:border-l border-white/[0.07]"
          style="background: rgba(10,11,16,0.95);"
          :class="panelIn ? 'panel-in' : 'panel-out'">

          <!-- ── Author header ── -->
          <div class="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07]">
            <div class="relative cursor-pointer flex-shrink-0 group/av"
              @click="router.push(`/profile/${post.user?.username}`)">
              <div class="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center
                border transition-all duration-200 group-hover/av:border-primary/50"
                style="background: rgba(255,255,255,0.05); border-color: rgba(227,225,235,0.12);">
                <img v-if="post.user?.avatar_url"
                  :src="post.user.avatar_url"
                  class="w-full h-full object-cover" />
                <i v-else class="bi bi-person-fill text-white/25 text-xl"></i>
              </div>
              <!-- Online dot -->
              <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                style="background: #05cc47; border-color: #0a0b10;"></div>
            </div>

            <div class="flex-1 min-w-0">
              <p class="font-black text-sm tracking-wider text-white cursor-pointer
                hover:text-primary transition-colors duration-200 truncate"
                @click="router.push(`/profile/${post.user?.username}`)">
                {{ post.user?.username }}
              </p>
              <p class="text-xs text-white/25 font-bold">
                {{ post.user?.tagline || 'Digital Creator' }}
              </p>
            </div>

            <button class="w-8 h-8 rounded-lg flex items-center justify-center text-white/25
              hover:text-white hover:bg-white/5 transition-all duration-200">
              <i class="bi bi-three-dots text-base"></i>
            </button>
          </div>

          <!-- ── Title ── -->
          <div v-if="post.title" class="px-5 pt-4 pb-0">
            <h2 class="font-black text-lg tracking-tight text-white leading-tight">{{ post.title }}</h2>
          </div>

          <!-- ── Caption ── -->
          <div class="px-5 py-4 flex-shrink-0">
            <p class="text-sm text-white/55 leading-relaxed">{{ post.caption }}</p>
            <!-- Tags -->
            <div v-if="post.tags?.length" class="flex flex-wrap gap-x-1.5 gap-y-1 mt-3">
              <span v-for="tag in post.tags" :key="tag"
                class="text-xs font-bold cursor-pointer transition-colors duration-150"
                style="color: rgba(5,204,71,0.7);"
                @mouseenter="e => e.target.style.color = '#05cc47'"
                @mouseleave="e => e.target.style.color = 'rgba(5,204,71,0.7)'">
                #{{ tag }}
              </span>
            </div>
          </div>

          <!-- ── Stats + Actions ── -->
          <div class="px-5 py-3 border-t border-b border-white/[0.07] flex items-center gap-5">

            <!-- Like -->
            <button @click="toggleLike"
              class="like-btn flex items-center gap-2 group/like">
              <span class="like-icon-wrap w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                :style="post.liked_by_me
                  ? 'background: rgba(5,204,71,0.12); border: 1px solid rgba(5,204,71,0.25);'
                  : 'background: rgba(255,255,255,0.04); border: 1px solid rgba(227,225,235,0.1);'"
                :class="post.liked_by_me ? '' : 'group-hover/like:border-primary/30 group-hover/like:bg-primary/5'">
                <i class="text-base transition-all duration-200 group-hover/like:scale-125"
                  :class="post.liked_by_me
                    ? 'bi bi-heart-fill text-primary like-pop'
                    : 'bi bi-heart text-white/40 group-hover/like:text-primary'"></i>
              </span>
              <span class="text-sm font-black tabular-nums transition-colors duration-200"
                :class="post.liked_by_me ? 'text-primary' : 'text-white/50'">
                {{ formatCount(post.likes_count) }}
              </span>
            </button>

            <!-- Comments -->
            <div class="flex items-center gap-2 text-white/40">
              <span class="w-8 h-8 rounded-lg flex items-center justify-center"
                style="background: rgba(255,255,255,0.04); border: 1px solid rgba(227,225,235,0.1);">
                <i class="bi bi-chat text-base"></i>
              </span>
              <span class="text-sm font-black tabular-nums text-white/50">
                {{ formatCount(post.comments_count) }}
              </span>
            </div>

            <!-- Share -->
            <button class="flex items-center justify-center w-8 h-8 rounded-lg
              text-white/30 hover:text-white/70 transition-all duration-200
              hover:bg-white/5"
              style="border: 1px solid rgba(227,225,235,0.1);">
              <i class="bi bi-send text-sm"></i>
            </button>

            <!-- Save (push to right) -->
            <button @click="saved = !saved"
              class="ml-auto flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
              :style="saved
                ? 'background: rgba(5,204,71,0.12); border: 1px solid rgba(5,204,71,0.25);'
                : 'background: rgba(255,255,255,0.04); border: 1px solid rgba(227,225,235,0.1);'">
              <i :class="saved ? 'bi bi-bookmark-fill text-primary' : 'bi bi-bookmark text-white/30'"
                class="text-base transition-all duration-200"></i>
            </button>
          </div>

          <!-- ── Meta strip ── -->
          <div v-if="post.views_count || post.created_at" class="px-5 py-2.5 border-b border-white/[0.07] flex items-center gap-4">
            <span v-if="post.views_count" class="flex items-center gap-1.5 text-xs font-bold text-white/25">
              <i class="bi bi-eye text-sm"></i>
              {{ formatCount(post.views_count) }} views
            </span>
            <span v-if="post.created_at" class="flex items-center gap-1.5 text-xs font-bold text-white/25">
              <i class="bi bi-clock text-sm"></i>
              {{ new Date(post.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) }}
            </span>
            <!-- Tools used -->
            <div v-if="post.tools?.length" class="ml-auto flex gap-1.5">
              <span v-for="tool in post.tools" :key="tool"
                class="px-2 py-0.5 rounded text-[10px] font-bold text-white/40 tracking-wider"
                style="border: 1px solid rgba(227,225,235,0.1); background: rgba(255,255,255,0.03);">
                {{ tool }}
              </span>
            </div>
          </div>

          <!-- ── Comments section ── -->
          <div class="flex-1 min-h-0 flex flex-col">
            <div class="px-5 pt-4 pb-2 flex items-center gap-2 flex-shrink-0">
              <i class="bi bi-chat-dots text-white/20 text-sm"></i>
              <h3 class="text-xs font-black tracking-widest text-white/30">COMMENTS</h3>
            </div>

            <div class="flex-1 overflow-y-auto px-5 pb-5 min-h-0 comments-scroll">
              <PostCommentList
                :postId="post.id"
                @count-changed="(cnt) => post.comments_count = cnt"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Below: Creator spotlight (optional extra) ── -->
      <div v-if="post.user" class="mt-6 flex items-center justify-between px-1">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
            style="background: rgba(255,255,255,0.04); border: 1px solid rgba(227,225,235,0.08);">
            <img v-if="post.user?.avatar_url" :src="post.user.avatar_url" class="w-full h-full object-cover" />
            <i v-else class="bi bi-person-fill text-white/20"></i>
          </div>
          <span class="text-xs text-white/25 font-bold">More from</span>
          <span class="text-xs font-black text-white/50 cursor-pointer hover:text-primary transition-colors"
            @click="router.push(`/profile/${post.user?.username}`)">
            {{ post.user?.username }}
          </span>
        </div>
        <button
          class="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black tracking-widest
            text-primary/80 hover:text-black hover:bg-primary transition-all duration-200"
          style="border: 1px solid rgba(5,204,71,0.25); background: rgba(5,204,71,0.06);">
          <i class="bi bi-person-plus text-sm"></i>
          WATCH
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── Image entrance ─── */
.image-out { opacity: 0; }
.image-in  { animation: image-reveal 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }

@keyframes image-reveal {
  from { opacity: 0; transform: scale(1.02); }
  to   { opacity: 1; transform: scale(1); }
}

/* ─── Panel entrance ─── */
.panel-out { opacity: 0; transform: translateX(12px); }
.panel-in  {
  animation: panel-slide 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation-delay: 0.1s;
}

@keyframes panel-slide {
  from { opacity: 0; transform: translateX(12px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ─── Image loaded reveal ─── */
.img-reveal {
  animation: img-in 0.5s ease both;
}

@keyframes img-in {
  from { opacity: 0; filter: blur(8px); }
  to   { opacity: 1; filter: blur(0); }
}

/* ─── Ambient glow ─── */
.ambient-glow {
  background: radial-gradient(ellipse at 50% 50%, rgba(5,204,71,0.04) 0%, transparent 70%);
  animation: glow-breathe 6s ease-in-out infinite;
}

@keyframes glow-breathe {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}

/* ─── Scanlines ─── */
.scanlines {
  background: repeating-linear-gradient(
    to bottom,
    transparent, transparent 2px,
    rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px
  );
  pointer-events: none;
}

/* ─── Corner accents animate ─── */
.corner-tl,
.corner-br {
  transition: opacity 0.3s ease;
  opacity: 0.5;
}

.post-shell:hover .corner-tl,
.post-shell:hover .corner-br {
  opacity: 1;
}

/* ─── Like pop ─── */
.like-pop {
  animation: like-bounce 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes like-bounce {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.5); }
  100% { transform: scale(1); }
}

/* ─── Comments scrollbar ─── */
.comments-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.08) transparent;
}

.comments-scroll::-webkit-scrollbar {
  width: 4px;
}

.comments-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.comments-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.08);
  border-radius: 4px;
}

.comments-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(5,204,71,0.3);
}

/* ─── Primary color utility ─── */
.text-primary  { color: #05cc47; }
.bg-primary    { background: #05cc47; }
.border-primary { border-color: #05cc47; }

/* ─── Tabular nums ─── */
.tabular-nums { font-variant-numeric: tabular-nums; }

/* ─── Post shell subtle hover ─── */
.post-shell {
  transition: border-color 0.3s ease;
}

.post-shell:hover {
  border-color: rgba(5, 204, 71, 0.12);
}
</style>