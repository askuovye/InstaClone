<script setup>
const props = defineProps({
  profile: { type: Object, required: true },
  showStats: { type: Boolean, default: false },
  animatedWatchers: { type: Number, default: 0 },
  animatedDeviations: { type: Number, default: 0 },
  animatedViews: { type: Number, default: 0 },
})

const emit = defineEmits(['navigate'])

function formatNumber(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

function handleNavigate(link) {
  if (link) {
    emit('navigate', link)
  }
}
</script>

<template>
  <div id="stats-section"
    class="mx-6 md:mx-10 mt-6 transition-all duration-700"
    :class="showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
    <div class="stats-bar grid grid-cols-3 rounded-xl border border-border bg-surface/60 backdrop-blur-sm overflow-hidden">
      <div v-for="(stat, i) in [
        { val: animatedWatchers, label: 'FOLLOWERS', raw: profile.followers_count, link: 'followers' },
        { val: animatedDeviations, label: 'POSTS', raw: profile.posts_count, link: null },
        { val: animatedViews, label: 'FOLLOWING', raw: profile.following_count, link: 'following' },
      ]" :key="i"
        class="stat-cell flex flex-col items-center justify-center py-5 relative"
        :class="{ 'cursor-pointer hover:bg-white/5 transition-colors': stat.link }"
        @click="handleNavigate(stat.link)"
        :style="{ transitionDelay: (i * 80) + 'ms' }">
        <div v-if="i < 2" class="absolute right-0 top-1/4 bottom-1/4 w-px bg-border"></div>
        <span class="text-primary font-black text-2xl md:text-3xl tracking-tight tabular-nums">
          {{ formatNumber(stat.val) }}
        </span>
        <span class="text-white/30 text-xs font-bold tracking-widest mt-1">{{ stat.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Any stats-specific styles can go here if needed */
</style>
