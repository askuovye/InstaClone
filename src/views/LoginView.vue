<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogin = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
    <!-- Abstract Background Elements -->
    <div class="absolute inset-0 z-0">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
      <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full"></div>
    </div>

    <!-- Login Card -->
    <div class="relative z-10 w-full max-w-md p-8 sm:p-10 bg-surface/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold text-white tracking-widest uppercase mb-2">
          Kinetic<span class="text-primary text-neon">.</span>
        </h1>
        <p class="text-gray-400">The premier platform for digital creators</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Email or Username</label>
          <input 
            type="text" 
            class="w-full bg-dark/50 border border-border text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            placeholder="neon_dreamer"
            value="neon_dreamer"
          >
        </div>
        
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-300">Password</label>
            <a href="#" class="text-xs text-primary hover:underline">Forgot?</a>
          </div>
          <input 
            type="password" 
            class="w-full bg-dark/50 border border-border text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            placeholder="••••••••"
            value="password"
          >
        </div>

        <button 
          type="submit" 
          class="w-full bg-primary text-black font-bold text-lg rounded-xl py-3 mt-4 hover-scale shadow-[0_0_20px_rgba(5,204,71,0.3)] transition-all"
        >
          Enter the Gallery
        </button>
      </form>

      <div class="mt-8 text-center text-sm text-gray-400">
        Don't have an account? <a href="#" class="text-white font-bold hover:text-primary transition-colors">Apply for access</a>
      </div>
    </div>
  </div>
</template>
