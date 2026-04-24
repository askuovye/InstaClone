<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user: authUser, logout } = useAuth()

const navItems = [
  { key: 'home', icon: 'home', label: 'HOME', to: '/' },
  { key: 'explore', icon: 'explore', label: 'EXPLORE', to: '/explore' },
  { key: 'create', icon: 'add_circle', label: 'CREATE', to: '/create' },
  { key: 'alerts', icon: 'notifications', label: 'ALERTS', to: '/notifications' },
  { key: 'profile', icon: 'person', label: 'PROFILE', to: '/profile' },
]

const activeNavKey = computed(() => {
  const path = route.path
  if (path.startsWith('/profile')) return 'profile'
  const match = navItems.find(i => i.to === path)
  return match ? match.key : 'home'
})

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-shell min-h-screen bg-dark text-white">

    <!-- ═══ DESKTOP TOP NAV ═══ -->
    <nav class="desktop-nav fixed top-0 left-0 right-0 z-50
      items-center gap-6 px-8 h-14
      bg-dark/90 backdrop-blur-xl border-b border-border">

      <div class="flex items-center gap-3 flex-shrink-0">
        <router-link to="/"
          class="brand-wordmark font-black text-xl tracking-tight text-primary italic">
          KINETIC
        </router-link>
      </div>

      <!-- Search -->
      <div class="flex-1 max-w-xs ml-6">
        <div class="relative">
          <span class="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm">search</span>
          <input type="text" placeholder="Search creators..."
            class="w-full bg-surface/80 border border-border rounded-lg
              pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 outline-none
              focus:border-primary/40 focus:bg-surface transition-all duration-200" />
        </div>
      </div>

      <!-- Right actions -->
      <div class="flex items-center gap-3 ml-auto flex-shrink-0">
        <router-link to="/create"
          class="submit-btn flex items-center gap-1.5 px-4 py-2 bg-primary text-black
            font-black text-xs tracking-widest rounded-lg hover:bg-primary/90
            transition-all duration-200 hover:shadow-[0_0_20px_rgba(5,204,71,0.4)]">
          <span class="material-symbols-rounded icon-filled text-sm">add_circle</span>
          New Post
        </router-link>

        <router-link to="/notifications"
          class="relative w-9 h-9 rounded-full bg-surface border border-border
            flex items-center justify-center hover:border-white/30 transition-colors">
          <span class="material-symbols-rounded text-white/50 text-xl">notifications</span>
        </router-link>

        <router-link to="/profile"
          class="w-9 h-9 rounded-full bg-surface border-2 border-primary/40
            flex items-center justify-center overflow-hidden hover:border-primary/70 transition-colors">
          <img v-if="authUser?.avatar_url" :src="authUser.avatar_url" class="w-full h-full object-cover" />
          <span v-else class="material-symbols-rounded icon-filled text-white/40">person</span>
        </router-link>
      </div>
    </nav>

    <!-- ═══ MOBILE TOPBAR ═══ -->
    <header class="mobile-topbar fixed top-0 left-0 right-0 z-50
      flex items-center justify-between px-4 py-3
      bg-dark/95 backdrop-blur-xl border-b border-border">
      <router-link to="/" class="brand-wordmark font-black text-lg tracking-tight text-primary italic">KINETIC</router-link>
      <div class="flex items-center gap-2">
        <router-link to="/notifications" class="w-8 h-8 flex items-center justify-center text-white/50">
          <span class="material-symbols-rounded text-xl">notifications</span>
        </router-link>
        <router-link to="/create" class="w-8 h-8 flex items-center justify-center text-primary">
          <span class="material-symbols-rounded icon-filled text-2xl">add_circle</span>
        </router-link>
      </div>
    </header>

    <!-- ═══ CONTENT AREA with SIDEBAR ═══ -->
    <div class="content-area flex">

      <!-- Desktop Left Sidebar -->
      <aside class="desktop-sidebar flex-col gap-2 w-52 flex-shrink-0 pt-6 pr-4
        sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div class="space-y-0.5">
          <router-link v-for="item in navItems" :key="item.key" :to="item.to"
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl
              font-bold text-sm tracking-wider transition-all duration-200 group"
            :class="activeNavKey === item.key
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'text-white/40 hover:text-white hover:bg-white/5'">
            <span class="material-symbols-rounded icon-filled text-xl transition-transform duration-200 group-hover:scale-110">
              {{ item.icon }}
            </span>
            {{ item.label }}
          </router-link>
        </div>

        <div class="mt-4 pt-4 border-t border-border">
          <router-link to="/create"
            class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
              bg-primary text-black font-black text-xs tracking-widest
              hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(5,204,71,0.35)] transition-all duration-200">
            <span class="material-symbols-rounded icon-filled text-base">add</span>
            NEW POST
          </router-link>
        </div>

        <!-- Logout -->
        <div class="mt-auto pt-4">
          <button @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
              text-white/30 hover:text-red-400 hover:bg-red-500/5
              font-bold text-sm tracking-wider transition-all duration-200">
            <span class="material-symbols-rounded text-xl">logout</span>
            LOGOUT
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1 min-w-0">
        <slot />
      </div>
    </div>

    <!-- ═══ MOBILE BOTTOM NAV ═══ -->
    <nav class="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50
      flex items-center justify-around px-2 py-2
      bg-dark/95 backdrop-blur-xl border-t border-border">
      <router-link v-for="item in navItems" :key="item.key" :to="item.to"
        class="mobile-nav-item flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
          font-black text-xs tracking-wider transition-all duration-200 relative"
        :class="activeNavKey === item.key
          ? 'text-primary'
          : 'text-white/30 hover:text-white/60'">
        <span class="material-symbols-rounded icon-filled text-2xl transition-all duration-200"
          :class="activeNavKey === item.key ? 'scale-110' : ''">
          {{ item.icon }}
        </span>
        <span class="text-[9px]">{{ item.label }}</span>
        <span v-if="activeNavKey === item.key"
          class="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></span>
      </router-link>
    </nav>

  </div>
</template>

<style scoped>
.app-shell { font-family: 'Inter', sans-serif; }

.brand-wordmark {
  background: linear-gradient(135deg, #05cc47 0%, #04a038 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

/*
  Bootstrap's .hidden uses display:none!important which overrides
  Tailwind's responsive md:flex. We use scoped CSS for responsive
  visibility instead to avoid the conflict.
*/

/* Desktop nav: hidden on mobile, flex on md+ */
.desktop-nav {
  display: none !important;
}
@media (min-width: 768px) {
  .desktop-nav {
    display: flex !important;
  }
}

/* Mobile topbar: flex on mobile, hidden on md+ */
.mobile-topbar {
  display: flex;
}
@media (min-width: 768px) {
  .mobile-topbar {
    display: none !important;
  }
}

/* Mobile bottom nav: flex on mobile, hidden on md+ */
.mobile-bottom-nav {
  display: flex;
}
@media (min-width: 768px) {
  .mobile-bottom-nav {
    display: none !important;
  }
}

/* Content area padding for fixed headers */
.content-area {
  padding-top: 3.25rem; /* mobile topbar height */
  padding-bottom: 5rem;  /* mobile bottom nav */
}
@media (min-width: 768px) {
  .content-area {
    padding-top: 3.5rem; /* desktop nav h-14 = 56px */
    padding-bottom: 0;
  }
}

.desktop-nav::before {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(5,204,71,0.3), transparent);
  animation: nav-line-sweep 4s ease-in-out infinite;
}

@keyframes nav-line-sweep {
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 1; }
}

.mobile-nav-item { position: relative; }

/* Desktop left sidebar: hidden on mobile, flex on lg+ */
.desktop-sidebar {
  display: none !important;
}
@media (min-width: 1024px) {
  .desktop-sidebar {
    display: flex !important;
  }
}

/* Sidebar scrollbar */
.desktop-sidebar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}
</style>
