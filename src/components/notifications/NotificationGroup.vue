<script setup>
import NotificationItem from './NotificationItem.vue'

const props = defineProps({
  group: { type: Object, required: true },
  gi: { type: Number, default: 0 },
  followBackMap: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['navigate', 'toggle-follow-back'])
</script>

<template>
  <div :style="{ animationDelay: (gi * 80) + 'ms' }">
    <!-- Group label -->
    <p class="text-xs font-black tracking-widest text-white/25 mb-3 px-1">
      {{ group.label }}
      <span v-if="group.label === 'NEW'"
        class="inline-flex items-center justify-center ml-2 px-2 py-0.5
          bg-primary/15 text-primary text-[10px] font-black rounded-full">
        {{ group.items.length }}
      </span>
    </p>

    <!-- Items -->
    <TransitionGroup name="item-fade" tag="div" class="space-y-2">
      <NotificationItem
        v-for="(notif, ni) in group.items"
        :key="notif.id"
        :notif="notif"
        :is-following-back="!!followBackMap[notif.data?.actor_id]"
        :style="{ animationDelay: (ni * 60 + gi * 100) + 'ms' }"
        @navigate="(username) => $emit('navigate', username)"
        @toggle-follow-back="(actorId) => $emit('toggle-follow-back', actorId)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* ─── Item fade ─── */
.item-fade-enter-active { transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.item-fade-enter-from   { opacity: 0; transform: translateX(-8px); }
.item-fade-leave-active { transition: all 0.25s ease; }
.item-fade-leave-to     { opacity: 0; transform: translateX(8px); }
</style>
