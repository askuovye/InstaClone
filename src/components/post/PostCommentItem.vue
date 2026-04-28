<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { storeToRefs } from 'pinia'
import { getAuthorDisplayName, getAuthorUsername } from '../../utils/profileUtils'
import { commentService as commentsApi } from '../../services/comment.service'

const props = defineProps({
  comment: { type: Object, required: true }
})
const emit = defineEmits(['delete', 'update'])
const authStore = useAuthStore()
const { user: authUser } = storeToRefs(authStore)
const router = useRouter()

const isOwn = computed(() => {
  if (!authUser.value || !props.comment) return false
  const myId = authUser.value.id
  const cId = props.comment.user_id || props.comment.userId || props.comment.user?.id
  return myId == cId
})
const isEditing = ref(false)
const editBody = ref(props.comment.body || '')
const isSubmitting = ref(false)
const showDeleteModal = ref(false)

function confirmDelete() {
  showDeleteModal.value = true
}

function handleDelete() {
  emit('delete', props.comment.id)
  showDeleteModal.value = false
}

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
      <i v-else class="bi bi-person-fill text-white/30 text-sm p-1"></i>
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
    
    <div v-if="isOwn && !isEditing" class="flex items-center gap-2 ml-2">
      <button @click="isEditing = true" 
        class="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-primary/10 text-white/40 hover:text-primary transition-all group/edit">
        <i class="bi bi-pencil text-[10px]"></i>
        <span class="text-[9px] font-black tracking-tighter opacity-0 group-hover/edit:opacity-100 transition-opacity">EDIT</span>
      </button>
      <button @click="confirmDelete" 
        class="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover: text-white/40 hover:text-red-400 transition-all group/del">
        <i class="bi bi-trash text-[10px]"></i>
        <span class="text-[9px] font-black tracking-tighter opacity-0 group-hover/del:opacity-100 transition-opacity">DELETE</span>
      </button>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showDeleteModal" class="fixed inset-0 z-[999] flex items-center justify-center px-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="showDeleteModal = false"></div>
          
          <!-- Modal Card -->
          <div class="relative bg-[#1a1b23] border border-white/10 rounded-2xl w-full max-w-[320px] overflow-hidden shadow-2xl">
            <div class="p-6 text-center">
              <div class="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <i class="bi bi-trash text-red-500 text-xl"></i>
              </div>
              <h3 class="text-white font-bold text-lg mb-2">Delete Comment?</h3>
              <p class="text-white/40 text-sm">This action cannot be undone. Are you sure you want to remove this comment?</p>
            </div>
            
            <div class="flex border-t border-white/5">
              <button @click="showDeleteModal = false" 
                class="flex-1 px-4 py-4 text-sm font-bold text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                CANCEL
              </button>
              <button @click="handleDelete" 
                class="flex-1 px-4 py-4 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors border-l border-white/5">
                DELETE
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>
