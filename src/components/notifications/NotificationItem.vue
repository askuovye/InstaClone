<script setup>
import { computed } from 'vue'
import { timeAgo } from '../../utils/dates'

const props = defineProps({
  notif: { type: Object, required: true },
  isFollowingBack: { type: Boolean, default: false }
})

const emit = defineEmits(['navigate', 'toggle-follow-back'])

// ─── Icon + color per notification type ───
const typeConfig = {
  like:    { icon: 'bi-heart-fill',    label: 'liked your post' },
  comment: { icon: 'bi-chat-fill',     label: 'commented on your post' },
  follow:  { icon: 'bi-person-plus-fill',  label: 'started following you' },
}

function handleProfileClick() {
  emit('navigate', props.notif.actor?.username)
}
</script>

<template>
  <div
    class="notif-card relative overflow-hidden rounded-2xl cursor-pointer
      transition-all duration-300 group"
    :class="notif.read_at ? '' : 'notif-unread'"
    :style="{
      background: 'rgba(255,255,255,0.03)',
      border: notif.read_at
        ? '1px solid rgba(227,225,235,0.07)'
        : '1px solid rgba(5,204,71,0.15)',
    }">

    <!-- Unread accent bar -->
    <div v-if="!notif.read_at"
      class="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
      style="background: #05cc47; box-shadow: 0 0 8px rgba(5,204,71,0.6);"></div>

    <!-- Hover glow -->
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      style="background: radial-gradient(ellipse at 20% 50%, rgba(5,204,71,0.04) 0%, transparent 70%);"></div>

    <div class="flex items-start gap-4 p-4 pl-5">

      <!-- Avatar + type badge -->
      <div class="relative flex-shrink-0">
        <div class="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center
          bg-surface border border-border"
          @click.stop="handleProfileClick">
          <img v-if="notif.actor?.avatar_url" :src="notif.actor.avatar_url"
            class="w-full h-full object-cover" />
          <i v-else class="bi bi-person-fill text-white/25 text-2xl"></i>
        </div>
        <!-- Type badge -->
        <div class="absolute -bottom-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center"
          style="background: #05cc47; border: 2px solid #0d0e14;">
          <i class="bi text-black" :class="typeConfig[notif.type]?.icon || 'bi-bell-fill'" style="font-size: 12px;"></i>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <p class="text-sm leading-relaxed text-white/75">
          <span class="font-black text-white cursor-pointer hover:text-primary transition-colors"
            @click.stop="handleProfileClick">
            {{ notif.actor?.username || notif.actor?.name || 'Someone' }}
          </span>
          {{ ' ' }}{{ typeConfig[notif.type]?.label || 'interacted with you' }}
        </p>

        <!-- Comment body (for comment type) -->
        <p v-if="notif.type === 'comment' && notif.data?.comment_body"
          class="mt-1.5 text-sm italic text-white/40 leading-relaxed line-clamp-2">
          "{{ notif.data.comment_body }}"
        </p>

        <!-- Time -->
        <p class="text-xs font-bold tracking-wider text-white/25 mt-2">
          {{ timeAgo(notif.created_at) }}
        </p>

        <!-- Follow-back CTA (for follow type) -->
        <div v-if="notif.type === 'follow' && notif.data?.actor_id" class="mt-3">
          <button
            @click.stop="$emit('toggle-follow-back', notif.data.actor_id)"
            class="px-4 py-1.5 text-xs font-black tracking-widest rounded-lg
              transition-all duration-200"
            :class="isFollowingBack
              ? 'bg-primary/10 border border-primary/30 text-primary'
              : 'bg-surface border border-border text-white/60 hover:border-primary/30 hover:text-primary'">
            {{ isFollowingBack ? '✓ FOLLOWING' : 'FOLLOW BACK' }}
          </button>
        </div>
      </div>

      <!-- Right: time + thumbnail -->
      <div class="flex flex-col items-end gap-2 flex-shrink-0">
        <span class="text-xs font-bold text-white/20 whitespace-nowrap">
          {{ timeAgo(notif.created_at) }}
        </span>

        <!-- Post thumbnail for like/comment -->
        <div v-if="notif.type !== 'follow' && notif.data?.post_id"
          class="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface border border-border
            transition-transform duration-300 group-hover:scale-105">
          <!-- Placeholder gradient since we don't have the post image in the notification -->
          <div class="w-full h-full relative"
            style="background: linear-gradient(135deg, rgba(5,204,71,0.05), rgba(5,204,71,0.15));">
            <div class="scanlines absolute inset-0 opacity-20"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <i class="bi bi-image text-primary/30 text-lg"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notif-unread {
  animation: card-in 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes card-in {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

.notif-card:hover {
  border-color: rgba(5, 204, 71, 0.2) !important;
  transform: translateX(2px);
}

.scanlines {
  background: repeating-linear-gradient(
    to bottom, transparent, transparent 2px,
    rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px
  );
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
