<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { loading: isLoading } = storeToRefs(authStore)
const { register } = authStore

const name = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const errors = ref({})
const globalError = ref('')

const usernameValid = computed(() => /^[a-zA-Z0-9_.]{3,30}$/.test(username.value))
const passwordStrength = computed(() => {
  const p = password.value
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^a-zA-Z0-9]/.test(p)) score++
  return score
})

const strengthLabel = computed(() => {
  const s = passwordStrength.value
  if (!password.value) return ''
  if (s <= 1) return 'WEAK'
  if (s === 2) return 'FAIR'
  if (s === 3) return 'GOOD'
  return 'STRONG'
})

const strengthColor = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return '#ff4040'
  if (s === 2) return '#ff9020'
  if (s === 3) return '#05cc47'
  return '#05cc47'
})

function validate() {
  const e = {}
  if (!name.value.trim()) e.name = 'Name is required.'
  if (!username.value.trim()) e.username = 'Username is required.'
  else if (!usernameValid.value) e.username = 'Username must be 3–30 chars: letters, numbers, _ or .'
  if (!email.value.trim()) e.email = 'Email is required.'
  if (!password.value) e.password = 'Password is required.'
  else if (password.value.length < 8) e.password = 'Password must be at least 8 characters.'
  if (password.value !== passwordConfirmation.value) e.passwordConfirmation = 'Passwords do not match.'
  errors.value = e
  return Object.keys(e).length === 0
}

async function handleRegister() {
  if (!validate()) return

  globalError.value = ''
  errors.value = {}

  try {
    await register({
      name: name.value,
      username: username.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    router.push('/')
  } catch (e) {
    if (e.errors) {
      errors.value = Object.fromEntries(
        Object.entries(e.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
      )
    } else if (e.message) {
      globalError.value = e.message
    } else {
      globalError.value = 'Connection error. Check if the server is running.'
    }
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-dark font-['Inter',sans-serif] overflow-hidden">

    <!-- Left panel: aesthetic side -->
    <div class="relative hidden md:flex flex-col justify-between py-6 px-8 overflow-hidden basis-[44%] shrink-0 bg-[#0a0b10]">
      <!-- Background glows -->
      <div class="absolute rounded-full pointer-events-none w-[500px] h-[500px] -top-20 -left-[100px] bg-[radial-gradient(circle,rgba(5,204,71,0.08)_0%,transparent_70%)]"></div>
      <div class="absolute rounded-full pointer-events-none w-[400px] h-[400px] -bottom-[60px] -right-20 bg-[radial-gradient(circle,rgba(0,120,255,0.06)_0%,transparent_70%)]"></div>
      <!-- Scanlines -->
      <div class="absolute inset-0 pointer-events-none z-[1] scanline-bg"></div>

      <!-- Brand -->
      <div class="relative z-2">
        <span class="text-primary font-black text-[0.9rem] tracking-[0.18em]">VERIDIAN</span>
      </div>

      <!-- Terminal badge -->
      <div class="absolute top-6 right-8 z-2 text-[0.6rem] font-semibold tracking-[0.1em] text-white/30 flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_#05cc47] animate-pulse"></span>
        SYSTEM STATUS: ACTIVE
        <span class="opacity-30">|</span>
        TERMINAL V2.0.4
      </div>

      <!-- Center Hero -->
      <div class="relative z-2 flex flex-col items-start gap-4 py-4 flex-1 justify-center">
        <!-- Energy visual -->
        <div class="relative w-40 h-40 mb-4">
          <div class="energy-ring absolute inset-0 rounded-full border border-primary/20" style="animation-duration:12s"></div>
          <div class="energy-ring absolute inset-5 rounded-full border border-primary/35" style="animation-duration:8s;animation-direction:reverse"></div>
          <div class="energy-ring absolute inset-10 rounded-full border border-primary/50" style="animation-duration:5s"></div>
          <div class="absolute inset-[55px] rounded-full bg-[radial-gradient(circle,rgba(5,204,71,0.9)_0%,rgba(0,180,50,0.3)_60%,transparent_100%)] shadow-[0_0_30px_rgba(5,204,71,0.6),0_0_60px_rgba(5,204,71,0.2)] animate-core-pulse"></div>
          <div class="energy-beam absolute top-1/2 left-1/2 w-1/2 h-px bg-gradient-to-r from-primary/80 to-transparent origin-left" style="animation-duration:4s;transform:translateY(-50%) rotate(30deg)"></div>
          <div class="energy-beam absolute top-1/2 left-1/2 w-1/2 h-px bg-gradient-to-r from-primary/80 to-transparent origin-left" style="animation-duration:6s;transform:translateY(-50%) rotate(150deg)"></div>
          <div class="energy-beam absolute top-1/2 left-1/2 w-1/2 h-px bg-gradient-to-r from-primary/80 to-transparent origin-left" style="animation-duration:8s;transform:translateY(-50%) rotate(270deg)"></div>
        </div>
        <h2 class="text-[2.8rem] font-black text-white leading-[0.95] tracking-tight m-0">KINETIC<br/>ENERGY.</h2>
        <p class="text-[0.78rem] text-white/40 leading-relaxed max-w-[280px] m-0">Join a collective of elite digital creators pushing the boundaries of the editorial web. Secure your uplink now.</p>
      </div>

      <!-- Stats bar -->
      <div class="relative z-2 flex items-center gap-6">
        <div class="flex flex-col gap-0.5">
          <span class="text-[0.85rem] font-extrabold text-white tracking-[0.05em]">12MS</span>
          <span class="text-[0.55rem] font-semibold tracking-[0.15em] text-white/30">LATENCY</span>
        </div>
        <div class="w-px h-[30px] bg-white/10"></div>
        <div class="flex flex-col gap-0.5">
          <span class="text-[0.85rem] font-extrabold text-primary tracking-[0.05em]">VRDN_SECURE</span>
          <span class="text-[0.55rem] font-semibold tracking-[0.15em] text-white/30">PROTOCOL</span>
        </div>
      </div>
    </div>

    <!-- Right panel: registration form -->
    <div class="flex-1 flex items-start md:items-center py-8 px-6 md:py-10 md:px-14 overflow-y-auto">
      <div class="max-w-[420px] w-full">

        <!-- Mobile brand (hidden on desktop) -->
        <div class="block md:hidden mb-6">
          <span class="text-primary font-black text-[0.9rem] tracking-[0.2em]">VERIDIAN</span>
        </div>

        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-[1.8rem] md:text-[2.2rem] font-black text-primary tracking-[0.02em] m-0 mb-1.5 leading-[1.05]">INITIALIZE<br/>PROFILE</h1>
          <p class="text-[0.82rem] text-white/40 m-0">Already have an uplink?
            <router-link to="/login" class="text-white/70 underline hover:text-white">Sign In</router-link>
          </p>
        </div>

        <!-- Global Error -->
        <div v-if="globalError" class="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-[#ff6b6b] text-[0.82rem] px-4 py-3 rounded-lg mb-6">
          <i class="bi bi-exclamation-triangle-fill text-[1.1rem]"></i>
          {{ globalError }}
        </div>

        <!-- Name -->
        <div class="mb-4">
          <label class="block text-[0.62rem] font-bold tracking-[0.15em] text-white/40 mb-1.5">DISPLAY NAME</label>
          <div class="relative flex items-center">
          <i class="bi bi-person absolute left-3.5 text-white/25 text-base pointer-events-none"></i>
            <input
              v-model="name"
              type="text"
              class="kn-input"
              :class="{ 'border-red-500/50 bg-red-500/[0.04]': errors.name }"
              placeholder="Your Name"
              autocomplete="name"
            />
          </div>
          <p v-if="errors.name" class="text-[0.72rem] text-[#ff6b6b] mt-1.5 mb-0">{{ errors.name }}</p>
        </div>

        <!-- Username -->
        <div class="mb-4">
          <label class="block text-[0.62rem] font-bold tracking-[0.15em] text-white/40 mb-1.5">UNIQUE USERNAME</label>
          <div class="relative flex items-center">
            <span class="absolute left-3.5 text-white/30 text-sm font-semibold pointer-events-none">@</span>
            <input
              v-model="username"
              type="text"
              class="kn-input !pl-7"
              :class="{
                'border-red-500/50 bg-red-500/[0.04]': errors.username,
                'border-primary/40': username && usernameValid
              }"
              placeholder="creator_handle"
              autocomplete="username"
            />
            <i v-if="username && usernameValid" class="bi bi-check-circle-fill absolute right-3 text-primary text-[1.1rem]"></i>
          </div>
          <p v-if="errors.username" class="text-[0.72rem] text-[#ff6b6b] mt-1.5 mb-0">{{ errors.username }}</p>
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label class="block text-[0.62rem] font-bold tracking-[0.15em] text-white/40 mb-1.5">EMAIL ADDRESS</label>
          <div class="relative flex items-center">
            <i class="bi bi-envelope absolute left-3.5 text-white/25 text-base pointer-events-none"></i>
            <input
              v-model="email"
              type="email"
              class="kn-input"
              :class="{ 'border-red-500/50 bg-red-500/[0.04]': errors.email }"
              placeholder="uplink@veridian.io"
              autocomplete="email"
            />
          </div>
          <p v-if="errors.email" class="text-[0.72rem] text-[#ff6b6b] mt-1.5 mb-0">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div class="mb-4">
          <label class="block text-[0.62rem] font-bold tracking-[0.15em] text-white/40 mb-1.5">PASSWORD</label>
          <div class="relative flex items-center">
            <i class="bi bi-lock absolute left-3.5 text-white/25 text-base pointer-events-none"></i>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="kn-input"
              :class="{ 'border-red-500/50 bg-red-500/[0.04]': errors.password }"
              placeholder="••••••••••••"
              autocomplete="new-password"
            />
            <button class="absolute right-3 bg-transparent border-none text-white/30 cursor-pointer p-0.5 flex hover:text-white/70" @click="showPassword = !showPassword" type="button">
              <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
            </button>
          </div>
          <!-- Strength meter -->
          <div v-if="password" class="flex items-center gap-3 mt-2">
            <div class="flex-1 h-[3px] bg-white/10 rounded-sm overflow-hidden">
              <div
                class="h-full rounded-sm transition-all duration-300 ease-out"
                :style="{ width: (passwordStrength / 4 * 100) + '%', background: strengthColor }"
              ></div>
            </div>
            <span class="text-[0.6rem] font-bold tracking-[0.1em] transition-colors duration-300" :style="{ color: strengthColor }">{{ strengthLabel }}</span>
          </div>
          <p v-if="errors.password" class="text-[0.72rem] text-[#ff6b6b] mt-1.5 mb-0">{{ errors.password }}</p>
        </div>

        <!-- Confirm Password -->
        <div class="mb-4">
          <label class="block text-[0.62rem] font-bold tracking-[0.15em] text-white/40 mb-1.5">CONFIRM PASSWORD</label>
          <div class="relative flex items-center">
            <i class="bi bi-shield-lock absolute left-3.5 text-white/25 text-base pointer-events-none"></i>
            <input
              v-model="passwordConfirmation"
              :type="showConfirm ? 'text' : 'password'"
              class="kn-input"
              :class="{
                'border-red-500/50 bg-red-500/[0.04]': errors.passwordConfirmation,
                'border-primary/40': passwordConfirmation && password === passwordConfirmation
              }"
              placeholder="••••••••••••"
              autocomplete="new-password"
              @keyup.enter="handleRegister"
            />
            <button class="absolute right-3 bg-transparent border-none text-white/30 cursor-pointer p-0.5 flex hover:text-white/70" @click="showConfirm = !showConfirm" type="button">
              <i class="bi" :class="showConfirm ? 'bi-eye-slash' : 'bi-eye'"></i>
            </button>
          </div>
          <p v-if="errors.passwordConfirmation" class="text-[0.72rem] text-[#ff6b6b] mt-1.5 mb-0">{{ errors.passwordConfirmation }}</p>
        </div>

        <!-- CTA -->
        <button
          class="w-full p-4 bg-primary text-black font-black text-[0.82rem] tracking-[0.15em] border-none rounded-lg cursor-pointer my-6 transition-all duration-200 flex items-center justify-center gap-2 hover:bg-[#04b840] hover:shadow-[0_0_24px_rgba(5,204,71,0.35)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          @click="handleRegister"
          :disabled="isLoading"
        >
          <i v-if="isLoading" class="bi bi-arrow-repeat animate-spin"></i>
          <span v-else>JOIN THE COLLECTIVE</span>
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-4 mb-5">
          <span class="flex-1 h-px bg-white/10"></span>
          <span class="text-[0.58rem] font-bold tracking-[0.15em] text-white/25 whitespace-nowrap">OR CONTINUE WITH</span>
          <span class="flex-1 h-px bg-white/10"></span>
        </div>

        <!-- OAuth -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <button class="flex items-center justify-center gap-2.5 py-3 px-4 bg-white/[0.04] border border-white/[0.12] rounded-lg text-white/65 text-[0.72rem] font-bold tracking-[0.1em] cursor-pointer transition-all duration-200 hover:bg-white/[0.07] hover:border-white/[0.22]">
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            GOOGLE
          </button>
          <button class="flex items-center justify-center gap-2.5 py-3 px-4 bg-white/[0.04] border border-white/[0.12] rounded-lg text-white/65 text-[0.72rem] font-bold tracking-[0.1em] cursor-pointer transition-all duration-200 hover:bg-white/[0.07] hover:border-white/[0.22]">
            <svg width="16" height="16" viewBox="0 0 814 1000" fill="white">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-47.4-148.2-106.6c-47.6-67.9-88.6-174.5-88.6-275.5 0-154.3 100.7-235.9 199.6-235.9 74.6 0 121.6 49.1 164.7 49.1 41.4 0 95.7-52 176.4-52 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
            </svg>
            APPLE
          </button>
        </div>

        <!-- Already member -->
        <p class="text-center text-[0.72rem] font-bold tracking-[0.1em] text-white/30 m-0 mb-4">
          ALREADY A MEMBER?
          <router-link to="/login" class="text-primary no-underline ml-1 hover:underline">SIGN IN</router-link>
        </p>

        <!-- Legal -->
        <p class="text-[0.65rem] text-white/20 text-center leading-relaxed m-0">
          By registering, you agree to our
          <a href="#" class="text-white/35 no-underline hover:text-white/60">Neural Interface Terms</a> · <a href="#" class="text-white/35 no-underline hover:text-white/60">Privacy Encryption Protocols</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Only styles that can't be expressed in Tailwind */
.scanline-bg {
  background: repeating-linear-gradient(
    to bottom,
    transparent, transparent 2px,
    rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px
  );
}

.energy-ring {
  animation: spin-slow linear infinite;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.energy-beam {
  animation: spin-slow linear infinite;
}

@keyframes core-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
}

.animate-core-pulse {
  animation: core-pulse 3s ease-in-out infinite;
}

/* Shared input style */
.kn-input {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(227,225,235,0.12);
  border-radius: 8px;
  padding: 0.8rem 1rem 0.8rem 2.6rem;
  color: #fff;
  font-size: 0.875rem;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}

.kn-input::placeholder { color: rgba(255,255,255,0.2); }

.kn-input:focus {
  border-color: #05cc47;
  background: rgba(5,204,71,0.03);
  box-shadow: 0 0 0 3px rgba(5,204,71,0.08);
}
</style>