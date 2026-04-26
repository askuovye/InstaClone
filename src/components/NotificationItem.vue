<script setup>
import { computed } from 'vue'

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
})

const iconMap = {
  like: 'bi-heart-fill',
  follow: 'bi-person-plus-fill',
  comment: 'bi-chat-fill'
}

const actionTextMap = {
  like: 'liked your post.',
  follow: 'started following you.',
  comment: 'commented:'
}

const icon = computed(() => iconMap[props.notification.type])
const actionText = computed(() => actionTextMap[props.notification.type])
</script>

<template>
  <div class="flex items-start gap-4 p-4 rounded-xl transition-colors hover:bg-white/5" :class="{ 'bg-primary/5': !notification.isRead }">
    <router-link :to="`/profile?user=${notification.user.username}`" class="relative shrink-0">
      <img :src="notification.user.avatar" alt="Avatar" class="w-12 h-12 rounded-full border border-border object-cover">
      <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-dark flex items-center justify-center">
        <i class="bi text-sm" :class="[icon, {
          'text-red-500': notification.type === 'like',
          'text-blue-400': notification.type === 'follow',
          'text-primary': notification.type === 'comment'
        }]"></i>
      </div>
    </router-link>

    <div class="flex-1 min-w-0 pt-1">
      <p class="text-sm text-gray-300">
        <router-link :to="`/profile?user=${notification.user.username}`" class="font-bold text-white hover:text-primary transition-colors">@{{ notification.user.username }}</router-link>
        {{ actionText }}
        <span v-if="notification.type === 'comment'" class="text-gray-400 italic block mt-1">"{{ notification.content }}"</span>
      </p>
      <p class="text-xs text-gray-500 mt-1">{{ notification.timeAgo }}</p>
    </div>

    <div v-if="notification.post" class="shrink-0">
      <img :src="notification.post.media" alt="Post Thumbnail" class="w-12 h-12 rounded bg-surface object-cover">
    </div>
    <div v-else-if="notification.type === 'follow'" class="shrink-0 flex items-center">
      <button class="bg-primary text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-green-400 transition-colors">Follow Back</button>
    </div>
  </div>
</template>
