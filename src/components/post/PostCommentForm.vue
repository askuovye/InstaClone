<script setup>
import { ref } from 'vue'
const emit = defineEmits(['submit'])
const content = ref('')
const isSubmitting = ref(false)

async function submit() {
  if (!content.value.trim() || isSubmitting.value) return
  isSubmitting.value = true
  try {
    await emit('submit', content.value)
    content.value = ''
  } finally {
    isSubmitting.value = false
  }
}
</script>
<template>
  <form @submit.prevent="submit" class="flex gap-3 items-end">
    <textarea v-model="content" rows="1" placeholder="Add a comment..." 
      class="flex-1 bg-surface border border-border focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-white resize-none outline-none"
      @keydown.enter.prevent="submit"></textarea>
    <button type="submit" :disabled="!content.trim() || isSubmitting"
      class="h-11 px-5 bg-primary text-black rounded-xl font-black text-xs tracking-widest disabled:opacity-50 hover:bg-primary/90 transition-all">
      {{ isSubmitting ? '...' : 'POST' }}
    </button>
  </form>
</template>
