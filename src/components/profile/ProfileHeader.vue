<script setup>
import { computed } from 'vue'

const props = defineProps({
  profile: { type: Object, required: true },
  isOwnProfile: { type: Boolean, default: false },
  isWatching: { type: Boolean, default: false },
  showBanner: { type: Boolean, default: true },
  showAvatar: { type: Boolean, default: true },
  showMeta: { type: Boolean, default: true },
  headerVisible: { type: Boolean, default: false },
  avatarPreview: { type: String, default: null },
  avatarUploading: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-watch', 'trigger-avatar-upload', 'edit-profile'])

function formatNumber(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}
</script>

<template>
  <div class="profile-header-components">
    <!-- ── Sticky floating header (appears on scroll) ── -->
    <Transition name="slide-down">
      <div v-if="headerVisible" class="sticky-header fixed top-0 left-0 right-0 z-50
        flex items-center gap-4 px-6 py-3
        bg-dark/90 backdrop-blur-lg border-b border-border">
        <div class="w-8 h-8 rounded-lg overflow-hidden border border-border flex-shrink-0
          flex items-center justify-center bg-surface">
          <img v-if="profile.avatar_url" :src="profile.avatar_url" class="w-full h-full object-cover" />
          <i v-else class="bi bi-person-fill text-primary text-sm"></i>
        </div>
        <span class="font-black text-sm tracking-widest">{{ profile.username }}</span>
        <div class="flex gap-6 ml-4 text-xs text-white/40 font-bold tracking-wider">
          <span>{{ formatNumber(profile.followers_count) }} <span class="text-white/25">FOLLOWERS</span></span>
          <span>{{ formatNumber(profile.posts_count) }} <span class="text-white/25">POSTS</span></span>
        </div>
        <button v-if="!isOwnProfile && !isWatching" @click="$emit('toggle-watch')"
          class="ml-auto btn-watch-sm flex items-center gap-1.5 px-4 py-1.5 rounded font-black text-xs tracking-widest"
          :class="isWatching ? 'bg-surface border border-border text-white/60' : 'bg-primary text-black'">
          <i class="bi text-sm" :class="isWatching ? 'bi-eye-slash' : 'bi-eye'"></i>
          {{ isWatching ? 'UNWATCH' : 'WATCH' }}
        </button>
      </div>
    </Transition>

    <!-- ── BANNER ── -->
    <div class="banner-wrap relative overflow-hidden"
      :class="showBanner ? 'banner-in' : 'banner-out'"
      style="height: 280px;">
      <!-- Animated banner background -->
      <div class="absolute inset-0" :style="{ background: profile.bannerGradient }">
        <!-- Neon beam animations -->
        <div class="beam beam-1"></div>
        <div class="beam beam-2"></div>
        <div class="beam beam-3"></div>
        <div class="absolute inset-0 scanlines pointer-events-none"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark"></div>
      </div>
    </div>

    <!-- ── PROFILE HEADER ── -->
    <div class="relative px-6 md:px-10 -mt-20 z-10">
      <div class="flex flex-col md:flex-row md:items-end gap-5 md:gap-8">

        <!-- Avatar -->
        <div class="avatar-wrap flex-shrink-0"
          :class="showAvatar ? 'avatar-in' : 'avatar-out'">
          <div class="relative w-28 h-28 md:w-36 md:h-36"
            :class="{ 'cursor-pointer': isOwnProfile }"
            @click="isOwnProfile ? $emit('trigger-avatar-upload') : null">
            <div class="avatar-glow absolute -inset-1 rounded-xl"></div>
            <div class="relative w-full h-full rounded-xl border-2 border-primary/60
              bg-surface overflow-hidden flex items-center justify-center group/avatar">
              <!-- Show preview or actual avatar -->
              <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover" />
              <img v-else-if="profile.avatar_url" :src="profile.avatar_url" class="w-full h-full object-cover" />
              <i v-else class="bi bi-person-fill text-white/30" style="font-size: 3rem"></i>
              <!-- Avatar shimmer overlay -->
              <div class="avatar-shimmer absolute inset-0"></div>
              <!-- Camera overlay for own profile -->
              <div v-if="isOwnProfile"
                class="avatar-camera-overlay absolute inset-0 flex flex-col items-center justify-center
                  bg-black/60 backdrop-blur-sm opacity-0 group-hover/avatar:opacity-100
                  transition-all duration-300 rounded-xl">
                <i v-if="avatarUploading" class="bi bi-arrow-repeat text-white text-2xl animate-spin"></i>
                <template v-else>
                  <i class="bi bi-camera-fill text-white text-2xl mb-1"></i>
                  <span class="text-white/80 text-[10px] font-bold tracking-widest">CHANGE</span>
                </template>
              </div>
            </div>
            <!-- Online dot -->
            <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-dark pulse-dot"></div>
          </div>
        </div>

        <!-- Name + actions -->
        <div class="flex-1 flex flex-col md:flex-row md:items-end gap-4 pb-2"
          :class="showMeta ? 'meta-in' : 'meta-out'">
          <div class="flex-1">
            <h1 class="profile-name text-3xl md:text-5xl font-black tracking-tight leading-none mb-1">
              {{ profile.name || profile.username }}
            </h1>
            <p class="text-white/40 text-xs md:text-sm font-bold tracking-widest uppercase">
              @{{ profile.username }}
            </p>
          </div>

          <div class="flex gap-3 flex-shrink-0">
            <button v-if="!isOwnProfile && !isWatching" @click="$emit('toggle-watch')"
              class="watch-btn flex items-center gap-2 px-6 py-2.5 rounded font-black text-sm tracking-widest transition-all duration-300"
              :class="isWatching
                ? 'bg-surface border border-border text-white/60 hover:border-white/30'
                : 'bg-primary text-black hover:bg-primary/90 watch-glow'">
              <i class="bi text-base" :class="isWatching ? 'bi-person-dash-fill' : 'bi-person-plus-fill'"></i>
              {{ isWatching ? 'WATCHING' : 'WATCH' }}
            </button>


            <button v-if="isOwnProfile" @click="$emit('edit-profile')"
              class="flex items-center gap-2 px-5 py-2.5 rounded font-black text-sm tracking-widest
                bg-surface border border-primary/40 text-primary
                hover:bg-primary hover:text-black transition-all duration-200">
              <i class="bi bi-pencil text-base"></i>
              EDIT PROFILE
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Copied animations from ProfileView.vue for banner/avatar */
.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-down-enter-from,
.slide-down-leave-to { opacity: 0; transform: translateY(-100%); }

.banner-out { opacity: 0; transform: scale(1.05); }
.banner-in { opacity: 1; transform: scale(1); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }

.avatar-out { opacity: 0; transform: translateY(20px) scale(0.9); }
.avatar-in { opacity: 1; transform: translateY(0) scale(1); transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }

.meta-out { opacity: 0; transform: translateX(20px); }
.meta-in { opacity: 1; transform: translateX(0); transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }

.beam {
  position: absolute;
  top: 0; bottom: 0;
  width: 100px;
  background: linear-gradient(90deg, transparent, rgba(5,204,71,0.15), transparent);
  animation: sweep 8s infinite linear;
  transform: skewX(-25deg);
}
.beam-1 { left: -20%; animation-duration: 12s; }
.beam-2 { left: 40%; animation-duration: 9s; animation-delay: -3s; }
.beam-3 { left: 80%; animation-duration: 15s; animation-delay: -7s; }
@keyframes sweep {
  0% { transform: translateX(-100vw) skewX(-25deg); }
  100% { transform: translateX(100vw) skewX(-25deg); }
}

.scanlines {
  background: repeating-linear-gradient(
    0deg,
    rgba(0,0,0,0.1) 0px,
    rgba(0,0,0,0.1) 1px,
    transparent 1px,
    transparent 2px
  );
  background-size: 100% 2px;
}

.avatar-glow {
  background: linear-gradient(135deg, #05cc47, transparent 60%);
  opacity: 0.3;
  filter: blur(10px);
  animation: breathe 4s ease-in-out infinite alternate;
}
@keyframes breathe {
  0% { opacity: 0.2; transform: scale(0.95); }
  100% { opacity: 0.5; transform: scale(1.05); }
}

.avatar-shimmer {
  background: linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.05) 50%, transparent 80%);
  background-size: 200% 100%;
  animation: shimmer 3s infinite linear;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.pulse-dot {
  box-shadow: 0 0 10px #05cc47;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(5,204,71,0.7); }
  70% { box-shadow: 0 0 0 6px rgba(5,204,71,0); }
  100% { box-shadow: 0 0 0 0 rgba(5,204,71,0); }
}

.watch-glow {
  box-shadow: 0 0 20px rgba(5,204,71,0.2);
}
</style>
