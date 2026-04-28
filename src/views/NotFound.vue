<script setup>
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '../router/routeNames'

const router = useRouter()
const token = localStorage.getItem('instaclone.token') || localStorage.getItem('auth_token')

function goHome() {
  if (token) {
    router.push({ name: ROUTE_NAMES.FEED })
  } else {
    router.push({ name: ROUTE_NAMES.LOGIN })
  }
}
</script>

<template>
  <div class="min-h-screen bg-dark text-white flex flex-col items-center justify-center text-center p-6" style="background: #0a0b10;">
    <h1 class="text-8xl font-black text-primary mb-4" style="text-shadow: 0 0 40px rgba(5,204,71,0.4)">404</h1>
    <h2 class="text-2xl font-bold text-white/80 tracking-widest mb-2">PAGE NOT FOUND</h2>
    <p class="text-white/40 mb-8 max-w-sm">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
    <button @click="goHome" class="px-6 py-3 bg-primary text-black font-black text-sm tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(5,204,71,0.4)] transition-all">
      {{ token ? 'RETURN TO FEED' : 'GO TO LOGIN' }}
    </button>
  </div>
</template>
