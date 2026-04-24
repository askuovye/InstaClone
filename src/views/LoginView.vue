<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { login, loading: isLoading } = useAuth()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const error = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields.'
    return
  }

  error.value = ''

  try {
    await login(email.value, password.value)
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (e) {
    if (e.status === 401) {
      error.value = 'Invalid credentials.'
    } else if (e.status === 422 && e.errors) {
      const firstError = Object.values(e.errors)[0]
      error.value = Array.isArray(firstError) ? firstError[0] : firstError
    } else if (e.message) {
      error.value = e.message
    } else {
      error.value = 'Connection error. Check if the server is running.'
    }
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-dark font-['Inter',sans-serif] overflow-hidden">
    <!-- Left panel: artwork showcase -->
    <div class="relative hidden md:flex flex-col justify-between p-8 overflow-hidden basis-[52%] shrink-0 bg-[#0d0e14]">
      <!-- Background overlays -->
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_40%_55%,rgba(5,204,71,0.06)_0%,transparent_70%),radial-gradient(ellipse_40%_40%_at_70%_30%,rgba(0,120,255,0.05)_0%,transparent_60%)]"></div>
      <div class="absolute inset-0 pointer-events-none z-[1] scanline-bg"></div>

      <!-- Brand -->
      <div class="relative z-2 flex items-center gap-2 text-primary font-extrabold text-lg tracking-[0.12em] italic">
        <span>
          <span class="material-symbols-rounded icon-filled text-[1.4rem]">palette</span>
        </span>
        <span>KINETIC</span>
      </div>

      <!-- Floating orbs -->
      <div class="absolute rounded-full pointer-events-none w-1.5 h-1.5 bg-[#b8a060] top-[25%] left-[20%] animate-float" style="animation-duration:7s"></div>
      <div class="absolute rounded-full pointer-events-none w-3 h-3 bg-[#c8b070] top-[30%] left-[55%] animate-float" style="animation-duration:9s;animation-delay:1s"></div>
      <div class="absolute rounded-full pointer-events-none w-2 h-2 bg-[#7ab8c8] top-[42%] left-[75%] animate-float" style="animation-duration:8s;animation-delay:2s"></div>
      <div class="absolute rounded-full pointer-events-none w-3.5 h-3.5 bg-[#c06080] top-[60%] left-[60%] animate-float" style="animation-duration:6s;animation-delay:0.5s"></div>
      <div class="absolute rounded-full pointer-events-none w-[5px] h-[5px] bg-primary top-[20%] left-[40%] animate-float" style="animation-duration:10s;animation-delay:3s"></div>

      <!-- Crescent Art -->
      <div class="absolute inset-0 flex items-center justify-center z-[1]">
        <div class="relative w-[340px] h-[340px]">
          <div class="crescent-shape"></div>
          <div class="absolute rounded-full animate-float w-9 h-9 top-[60px] left-[50px] bg-[radial-gradient(circle_at_35%_35%,#d0b880,#705020)]" style="animation-duration:7s"></div>
          <div class="absolute rounded-full animate-float w-[22px] h-[22px] top-[30px] left-[180px] bg-[radial-gradient(circle_at_35%_35%,#90c0e0,#204060)]" style="animation-duration:9s;animation-delay:1s"></div>
          <div class="absolute rounded-full animate-float w-4 h-4 top-[10px] left-[240px] bg-[radial-gradient(circle_at_35%_35%,#80b0c0,#304050)]" style="animation-duration:8s;animation-delay:2s"></div>
          <div class="absolute rounded-full animate-float w-7 h-7 top-[200px] left-[230px] bg-[radial-gradient(circle_at_35%_35%,#e08090,#602030)]" style="animation-duration:6s;animation-delay:0.5s"></div>
          <div class="absolute rounded-full animate-float w-2.5 h-2.5 top-[260px] left-[170px] bg-[radial-gradient(circle_at_35%_35%,#90d0a0,#204030)]" style="animation-duration:10s;animation-delay:3s"></div>
        </div>
      </div>

      <!-- Featured Creator -->
      <div class="relative z-2 max-w-[360px]">
        <div class="flex items-center gap-1.5 text-primary text-[0.65rem] font-bold tracking-[0.15em] mb-2.5">
          <span class="material-symbols-rounded icon-filled text-[0.9rem]">star</span>
          FEATURED CREATOR
        </div>
        <div class="flex items-start gap-3 mb-3">
          <div class="w-[42px] h-[42px] rounded-lg bg-gradient-to-br from-[#1e3a2a] to-[#0d1e14] border-[1.5px] border-primary/30 flex items-center justify-center shrink-0 text-primary">
            <span class="material-symbols-rounded icon-filled">person</span>
          </div>
          <div>
            <p class="text-[0.95rem] font-extrabold text-white tracking-[0.05em] m-0 mb-1">SYST3M_ERROR</p>
            <p class="text-xs text-white/50 m-0 leading-relaxed">"The intersection of algorithmic precision and chaotic organic forms defines our digital future."</p>
          </div>
        </div>
        <div class="flex gap-2">
          <span class="text-[0.6rem] font-bold tracking-[0.1em] text-white/60 border border-white/15 px-2.5 py-1 rounded-sm">3D RENDER</span>
          <span class="text-[0.6rem] font-bold tracking-[0.1em] text-white/60 border border-white/15 px-2.5 py-1 rounded-sm">EXPERIMENTAL</span>
        </div>
      </div>
    </div>

    <!-- Right panel: login form -->
    <div class="flex-1 flex flex-col justify-between md:justify-between p-8 px-6 md:py-12 md:px-16 bg-dark">
      <div class="max-w-[440px] w-full my-auto pt-0 md:pt-8">
        <!-- Header -->
        <div class="mb-10 text-center md:text-left">
          <h1 class="text-[2rem] md:text-[2.5rem] font-black text-white tracking-tight m-0 mb-2 leading-none">WELCOME BACK</h1>
          <p class="text-white/45 text-sm m-0">Continue your journey in the kinetic gallery.</p>
        </div>

        <!-- Error -->
        <div v-if="error" class="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-[#ff6b6b] text-[0.82rem] px-4 py-3 rounded-lg mb-6">
          <span class="material-symbols-rounded text-[1.1rem]">error</span>
          {{ error }}
        </div>

        <!-- Email Field -->
        <div class="mb-5">
          <label class="block text-[0.65rem] font-bold tracking-[0.15em] text-white/50 mb-2">USER IDENTITY</label>
          <div class="relative flex items-center">
            <span class="material-symbols-rounded absolute left-3.5 text-white/30 text-[1.1rem] pointer-events-none">alternate_email</span>
            <input
              v-model="email"
              type="email"
              class="w-full bg-white/[0.04] border border-border rounded-lg py-3.5 pl-11 pr-4 text-white text-sm font-['Inter',sans-serif] outline-none transition-all duration-200 placeholder:text-white/25 focus:border-primary focus:bg-primary/[0.04]"
              placeholder="username or email"
              autocomplete="email"
              @keyup.enter="handleLogin"
            />
          </div>
        </div>

        <!-- Password Field -->
        <div class="mb-5">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-[0.65rem] font-bold tracking-[0.15em] text-white/50">SECURITY KEY</label>
            <router-link to="/forgot-password" class="text-[0.65rem] font-bold tracking-[0.1em] text-primary no-underline hover:underline">RECOVER ACCESS</router-link>
          </div>
          <div class="relative flex items-center">
            <span class="material-symbols-rounded absolute left-3.5 text-white/30 text-[1.1rem] pointer-events-none">lock</span>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full bg-white/[0.04] border border-border rounded-lg py-3.5 pl-11 pr-12 text-white text-sm font-['Inter',sans-serif] outline-none transition-all duration-200 placeholder:text-white/25 focus:border-primary focus:bg-primary/[0.04]"
              placeholder="••••••••"
              autocomplete="current-password"
              @keyup.enter="handleLogin"
            />
            <button class="absolute right-3 bg-transparent border-none text-white/35 cursor-pointer p-1 flex hover:text-white/70" @click="showPassword = !showPassword" type="button">
              <span class="material-symbols-rounded">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>

        <!-- Remember Me -->
        <label class="flex items-center gap-2.5 text-[0.82rem] text-white/50 cursor-pointer mb-7 select-none">
          <input v-model="rememberMe" type="checkbox" class="kn-checkbox" />
          <span>Maintain persistence across sessions</span>
        </label>

        <!-- CTA Button -->
        <button
          class="w-full p-4 bg-primary text-black font-black text-[0.85rem] tracking-[0.15em] border-none rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 mb-8 hover:bg-[#04b840] hover:shadow-[0_0_24px_rgba(5,204,71,0.35)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          @click="handleLogin"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="material-symbols-rounded animate-spin">autorenew</span>
          <span v-else>AUTHENTICATE</span>
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-4 mb-5">
          <span class="flex-1 h-px bg-border"></span>
          <span class="text-[0.6rem] font-bold tracking-[0.15em] text-white/30 whitespace-nowrap">THIRD PARTY UPLINK</span>
          <span class="flex-1 h-px bg-border"></span>
        </div>

        <!-- OAuth -->
        <div class="grid grid-cols-2 gap-3 mb-8">
          <button class="flex items-center justify-center gap-2.5 py-3 px-4 bg-white/5 border border-border rounded-lg text-white/75 text-xs font-bold tracking-[0.1em] cursor-pointer transition-all duration-200 hover:bg-white/[0.08] hover:border-white/25">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            GOOGLE
          </button>
          <button class="flex items-center justify-center gap-2.5 py-3 px-4 bg-white/5 border border-border rounded-lg text-white/75 text-xs font-bold tracking-[0.1em] cursor-pointer transition-all duration-200 hover:bg-white/[0.08] hover:border-white/25">
            <svg width="18" height="18" viewBox="0 0 814 1000" fill="white">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-47.4-148.2-106.6c-47.6-67.9-88.6-174.5-88.6-275.5 0-154.3 100.7-235.9 199.6-235.9 74.6 0 121.6 49.1 164.7 49.1 41.4 0 95.7-52 176.4-52 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
            </svg>
            APPLE
          </button>
        </div>

        <!-- Join Link -->
        <p class="text-center text-[0.82rem] text-white/40 m-0">
          New to the grid?
          <router-link to="/register" class="text-primary font-bold text-[0.82rem] no-underline tracking-[0.05em] ml-1 hover:underline">JOIN THE COLLECTIVE</router-link>
        </p>
      </div>

      <!-- Footer -->
      <footer class="flex gap-6 items-center text-[0.7rem] text-white/20 tracking-[0.05em] md:justify-start justify-center flex-wrap">
        <span>© 2024 KINETIC</span>
        <a href="#" class="text-white/25 no-underline transition-colors duration-200 hover:text-white/60">TERMS</a>
        <a href="#" class="text-white/25 no-underline transition-colors duration-200 hover:text-white/60">PRIVACY</a>
        <a href="#" class="text-white/25 no-underline transition-colors duration-200 hover:text-white/60">STATUS</a>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Only styles that can't be expressed in Tailwind */
.scanline-bg {
  background: repeating-linear-gradient(
    to bottom,
    transparent, transparent 2px,
    rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px
  );
}

.crescent-shape {
  position: absolute;
  width: 300px;
  height: 300px;
  top: 20px;
  left: 20px;
  border-radius: 50%;
  background: conic-gradient(from 120deg, #b87830, #7aaa90, #3070b0, #8090a0, #b87830);
  clip-path: path('M 150 0 A 150 150 0 1 1 150 300 A 90 90 0 1 0 150 0 Z');
  filter: blur(2px) brightness(0.85);
  animation: rotateSlow 20s linear infinite;
}

@keyframes rotateSlow {
  from { filter: blur(2px) brightness(0.85) hue-rotate(0deg); }
  to { filter: blur(2px) brightness(0.85) hue-rotate(30deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-14px); }
}

.animate-float { animation: float 6s ease-in-out infinite; }

.kn-checkbox {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid rgba(227,225,235,0.25);
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: border-color 0.2s, background 0.2s;
}

.kn-checkbox:checked {
  background: #05cc47;
  border-color: #05cc47;
}

.kn-checkbox:checked::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 4px;
  width: 5px;
  height: 8px;
  border: 2px solid #000;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}
</style>