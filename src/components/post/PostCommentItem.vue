<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getAuthorDisplayName, getAuthorUsername } from '../../utils/profileUtils'
import { comments as commentsApi } from '../../services/api'

const props = defineProps({
  comment: { type: Object, required: true }
})
const emit = defineEmits(['delete', 'update'])
const authStore = useAuthStore()
const router = useRouter()

const isOwn = computed(() => authStore.user?.id === props.comment.user_id)
const isEditing = ref(false)
const editBody = ref(props.comment.body || '')
const isSubmitting = ref(false)

function goToProfile() {
  if (props.comment.user?.username) {
    router.push(`/profile/${props.comment.user.username}`)
  }
}

async function saveEdit() {
  if (!editBody.value.trim() || isSubmitting.value) return
  isSubmitting.value = true
  try {
    const updated = await commentsApi.update(props.comment.id, editBody.value)
    emit('update', updated)
    isEditing.value = false
  } catch (e) {
    console.error('Failed to update comment:', e)
  } finally {
    isSubmitting.value = false
  }
}

function cancelEdit() {
  isEditing.value = false
  editBody.value = props.comment.body || ''
}
</script>
<template>
  <div class="flex gap-3 py-3 border-b border-border/30 last:border-0 group">
    <div @click="goToProfile" class="w-8 h-8 rounded-full overflow-hidden bg-surface cursor-pointer flex-shrink-0 border border-border">
      <img v-if="comment.user?.avatar_url" :src="comment.user.avatar_url" class="w-full h-full object-cover" />
      <span v-else class="material-symbols-rounded text-white/30 text-sm p-1">person</span>
    </div>
    
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline gap-2">
        <span @click="goToProfile" class="text-sm font-bold text-white cursor-pointer hover:text-primary transition-colors">
          {{ getAuthorUsername(comment.user) }}
        </span>
      </div>
      
      <div v-if="isEditing" class="mt-2 flex gap-2 items-end">
        <textarea v-model="editBody" rows="2" 
          class="flex-1 bg-surface border border-border focus:border-primary/50 rounded-xl px-3 py-2 text-sm text-white resize-none outline-none"
          @keydown.ctrl.enter="saveEdit"
        ></textarea>
        <div class="flex flex-col gap-1">
          <button @click="saveEdit" :disabled="isSubmitting" class="text-[10px] font-black bg-primary text-black px-2 py-1 rounded hover:bg-primary/90 disabled:opacity-50">SAVE</button>
          <button @click="cancelEdit" :disabled="isSubmitting" class="text-[10px] font-black bg-surface border border-border text-white/60 px-2 py-1 rounded hover:text-white disabled:opacity-50">CANCEL</button>
        </div>
      </div>
      <p v-else class="text-sm text-white/70 mt-0.5 break-words">{{ comment.body }}</p>
    </div>
    
    <div v-if="isOwn && !isEditing" class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
      <button @click="isEditing = true" class="text-white/20 hover:text-primary p-1">
        <span class="material-symbols-rounded text-sm">edit</span>
      </button>
      <button @click="emit('delete', comment.id)" class="text-white/20 hover:text-red-400 p-1">
        <span class="material-symbols-rounded text-sm">delete</span>
      </button>
    </div>
  </div>
</template>
