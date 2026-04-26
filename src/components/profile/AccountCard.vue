<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFollowsStore } from '../../stores/follows'
import { getAuthorDisplayName, getAuthorUsername } from '../../utils/profileUtils'

const props = defineProps({
  user: { type: Object, required: true },
})

const router = useRouter()
const followsStore = useFollowsStore()

// Initialize follow state on mount based on backend status if available
onMounted(() => {
  if (props.user.is_following !== undefined) {
    followsStore.initializeFollowStatus(props.user.id, props.user.is_following)
  }
})

const isFollowing = computed(() => followsStore.isFollowing(props.user.id))
const isLoading = computed(() => followsStore.isLoading(props.user.id))

function toggleFollow() {
  followsStore.toggleFollow(props.user.id)
}

function goToProfile() {
  if (props.user.username) {
    router.push(`/profile/${props.user.username}`)
  }
}
</script>

<template>
  <div class="account-card flex items-center justify-between p-4 bg-surface/40 hover:bg-surface rounded-xl border border-border/50 hover:border-border transition-all duration-300">
    <div class="flex items-center gap-4 flex-1 min-w-0 cursor-pointer group" @click="goToProfile">
      <div class="w-12 h-12 rounded-full overflow-hidden bg-dark flex items-center justify-center border border-border flex-shrink-0 group-hover:border-primary/40 transition-colors">
        <img v-if="user.avatar_url" :src="user.avatar_url" class="w-full h-full object-cover" />
        <span v-else class="material-symbols-rounded icon-filled text-white/30 text-xl">person</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-white tracking-wide truncate group-hover:text-primary transition-colors">{{ getAuthorUsername(user) }}</p>
        <p class="text-[0.7rem] font-bold text-white/30 tracking-wider truncate uppercase mt-0.5">{{ getAuthorDisplayName(user) }}</p>
      </div>
    </div>
    
    <button @click="toggleFollow" :disabled="isLoading"
      class="ml-4 px-5 py-2 rounded-lg text-[0.65rem] font-black tracking-[0.15em] transition-all duration-200 disabled:opacity-50 min-w-[100px]"
      :class="isFollowing 
        ? 'bg-transparent border border-white/10 text-white/50 hover:border-white/30 hover:text-white' 
        : 'bg-primary border border-primary text-black hover:bg-primary/80 hover:shadow-[0_0_15px_rgba(5,204,71,0.3)]'">
      {{ isLoading ? 'WAIT' : isFollowing ? 'FOLLOWING' : 'FOLLOW' }}
    </button>
  </div>
</template>
