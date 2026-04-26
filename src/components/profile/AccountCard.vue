<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFollowsStore } from '../../stores/follows'
import { getAuthorDisplayName, getAuthorUsername } from '../../utils/profileUtils'

const props = defineProps({
  user: { type: Object, required: true },
  compact: { type: Boolean, default: false }
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
  <div class="account-card flex transition-all duration-300"
    :class="[
      compact 
        ? 'flex-col items-center p-3 gap-2 bg-surface/20 border border-border/20 rounded-2xl w-full' 
        : 'items-center justify-between p-4 bg-surface/40 hover:bg-surface rounded-xl border border-border/50 hover:border-border'
    ]">
    
    <div class="flex cursor-pointer group" 
      :class="[compact ? 'flex-col items-center text-center' : 'items-center gap-4 flex-1 min-w-0']"
      @click="goToProfile">
      
      <div class="rounded-full overflow-hidden bg-dark flex items-center justify-center border border-border flex-shrink-0 group-hover:border-primary/40 transition-colors"
        :class="[compact ? 'w-14 h-14 mb-1' : 'w-12 h-12']">
        <img v-if="user.avatar_url" :src="user.avatar_url" class="w-full h-full object-cover" />
        <i v-else class="bi bi-person-fill text-white/30" :class="[compact ? 'text-2xl' : 'text-xl']"></i>
      </div>

      <div :class="[compact ? 'w-full' : 'flex-1 min-w-0']">
        <p class="font-bold text-white tracking-wide truncate group-hover:text-primary transition-colors"
          :class="[compact ? 'text-xs mb-0.5' : 'text-sm']">
          {{ getAuthorUsername(user) }}
        </p>
        <p class="font-bold text-white/30 tracking-wider truncate uppercase mt-0.5"
          :class="[compact ? 'text-[0.6rem]' : 'text-[0.7rem]']">
          {{ getAuthorDisplayName(user) }}
        </p>
      </div>
    </div>
    
    <button @click="toggleFollow" :disabled="isLoading"
      class="rounded-lg text-[0.6rem] font-black tracking-[0.1em] transition-all duration-200 disabled:opacity-50"
      :class="[
        compact ? 'w-full mt-2 py-1.5' : 'ml-4 px-5 py-2 min-w-[100px]',
        isFollowing 
          ? 'bg-transparent border border-white/10 text-white/50 hover:border-white/30 hover:text-white' 
          : 'bg-primary border border-primary text-black hover:bg-primary/80 hover:shadow-[0_0_15px_rgba(5,204,71,0.3)]'
      ]">
      {{ isLoading ? 'WAIT' : isFollowing ? 'FOLLOWING' : 'FOLLOW' }}
    </button>
  </div>
</template>
