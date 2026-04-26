<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { follow as followApi } from '../services/api'
import AccountCard from '../components/profile/AccountCard.vue'

const route = useRoute()
const router = useRouter()

const type = computed(() => route.params.type)
const username = computed(() => route.params.username || '') // Assuming we pass it or it's context
// Wait, the API for followers/following takes userId. So we either need userId in query or fetch user first.
// Let's assume we pass userId in query params: ?userId=123
const userId = computed(() => route.query.userId)

const users = ref([])
const loading = ref(true)
const error = ref('')

async function fetchConnections() {
  if (!userId.value) {
    error.value = 'User ID is missing.'
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    let data
    if (type.value === 'followers') {
      data = await followApi.followers(userId.value)
    } else if (type.value === 'following') {
      data = await followApi.following(userId.value)
    } else {
      throw new Error('Invalid connection type')
    }
    
    users.value = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : [])
  } catch (e) {
    error.value = 'Failed to load connections.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch([type, userId], () => {
  fetchConnections()
})

onMounted(() => {
  fetchConnections()
})

const pageTitle = computed(() => type.value === 'followers' ? 'FOLLOWERS' : 'FOLLOWING')
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 md:px-8 py-8 min-h-[calc(100vh-8rem)]">
    
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8 border-b border-border/50 pb-4">
      <button @click="$router.back()" class="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center hover:bg-surface/80 transition-colors">
        <span class="material-symbols-rounded text-white/60">arrow_back</span>
      </button>
      <div>
        <h1 class="text-2xl font-black tracking-tight italic">{{ pageTitle }}</h1>
        <p class="text-xs text-white/30 font-bold mt-0.5 tracking-widest">CONNECTIONS</p>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-6 flex items-center justify-center py-10 text-center">
      <div class="flex flex-col items-center">
        <span class="material-symbols-rounded text-red-400/30 text-4xl mb-3">error</span>
        <p class="text-red-300 text-sm font-bold tracking-wider">{{ error }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="flex flex-col gap-3">
      <div v-for="i in 5" :key="i" class="h-20 rounded-xl bg-surface animate-pulse"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="users.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <div class="w-16 h-16 rounded-2xl bg-surface/60 border border-border flex items-center justify-center mb-4">
        <span class="material-symbols-rounded text-white/20 text-3xl">people</span>
      </div>
      <h2 class="text-sm font-black tracking-widest text-white/40 mb-1">NO CONNECTIONS YET</h2>
      <p class="text-xs text-white/20">This list is currently empty.</p>
    </div>

    <!-- List -->
    <div v-else class="flex flex-col gap-3">
      <AccountCard v-for="user in users" :key="user.id" :user="user" />
    </div>

  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.7; }
}
.animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
</style>
