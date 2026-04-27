<script setup>
import AccountCard from '../profile/AccountCard.vue'

const props = defineProps({
  suggestions: { type: Array, required: true },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['refresh'])
</script>

<template>
  <div class="mb-10" v-if="!isLoading && suggestions.length > 0">
    <div class="flex items-center justify-between mb-4 px-2">
      <h2 class="text-xs font-black tracking-widest text-white/40">SUGGESTED FOR YOU</h2>
      <button @click="$emit('refresh')" class="text-[10px] font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-widest">
        Refresh
      </button>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <AccountCard v-for="user in suggestions" :key="user.id" :user="user" :compact="true" />
    </div>
  </div>
</template>
