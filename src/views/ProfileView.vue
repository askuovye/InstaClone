<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { currentUser, exploreGrid } from '../data/mock'
import ArtGrid from '../components/ArtGrid.vue'

const route = useRoute()
const username = computed(() => route.query.user || currentUser.username)
// Mock user profile loading (just using currentUser for demo)
const profile = currentUser
</script>

<template>
  <div class="max-w-4xl mx-auto w-full">
    <!-- Profile Header -->
    <div class="bg-surface rounded-3xl p-6 md:p-10 mb-8 border border-border flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
      <!-- Abstract BG inside header -->
      <div class="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[50px] pointer-events-none"></div>

      <!-- Avatar -->
      <div class="relative shrink-0">
        <div class="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-primary to-blue-500">
          <div class="w-full h-full rounded-full border-4 border-surface overflow-hidden bg-dark">
            <img :src="profile.avatar" alt="Profile Avatar" class="w-full h-full object-cover">
          </div>
        </div>
        <div v-if="profile.isPro" class="absolute bottom-2 right-2 bg-primary text-black text-xs font-black px-2 py-1 rounded border-2 border-surface shadow-lg">PRO</div>
      </div>

      <!-- User Info -->
      <div class="flex-1 text-center md:text-left z-10">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 class="text-2xl md:text-3xl font-black text-white">{{ profile.fullName }}</h2>
            <p class="text-gray-400 font-medium">@{{ profile.username }}</p>
          </div>
          <div class="flex items-center justify-center gap-3">
            <button v-if="profile.username !== currentUser.username" class="bg-primary text-black font-bold px-6 py-2 rounded-full hover:bg-green-400 transition-colors">
              Follow
            </button>
            <button v-else class="bg-dark text-white font-bold px-6 py-2 rounded-full border border-border hover:bg-white/5 transition-colors">
              Edit Profile
            </button>
            <button class="w-10 h-10 rounded-full border border-border flex items-center justify-center text-white hover:bg-white/5 transition-colors">
              <span class="material-symbols-rounded">more_horiz</span>
            </button>
          </div>
        </div>

        <p class="text-gray-300 mb-6 max-w-lg mx-auto md:mx-0">{{ profile.bio }}</p>

        <!-- Stats -->
        <div class="flex items-center justify-center md:justify-start gap-8 border-t border-border/50 pt-6">
          <div class="text-center md:text-left">
            <p class="text-2xl font-bold text-white">{{ profile.followers.toLocaleString() }}</p>
            <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Followers</p>
          </div>
          <div class="text-center md:text-left">
            <p class="text-2xl font-bold text-white">{{ profile.following.toLocaleString() }}</p>
            <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Following</p>
          </div>
          <div class="text-center md:text-left">
            <p class="text-2xl font-bold text-white">128</p>
            <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Artworks</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Gallery Grid -->
    <div>
      <div class="flex items-center gap-6 border-b border-border mb-6 px-4">
        <button class="pb-3 text-primary border-b-2 border-primary font-medium flex items-center gap-2">
          <span class="material-symbols-rounded text-[20px]">grid_on</span> Works
        </button>
        <button class="pb-3 text-gray-400 hover:text-white transition-colors font-medium flex items-center gap-2">
          <span class="material-symbols-rounded text-[20px]">favorite</span> Saved
        </button>
      </div>

      <ArtGrid :items="exploreGrid.slice(0, 5)" />
    </div>
  </div>
</template>
