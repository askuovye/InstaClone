<script setup>
import PostCommentItem from './PostCommentItem.vue'
import PostCommentForm from './PostCommentForm.vue'
import { comments as commentsApi } from '../../services/api'
import { ref, onMounted } from 'vue'

const props = defineProps({
  postId: { type: [String, Number], required: true }
})
const emit = defineEmits(['count-changed'])
const commentsList = ref([])
const loading = ref(true)

async function loadComments() {
  loading.value = true
  try {
    const res = await commentsApi.list(props.postId)
    commentsList.value = Array.isArray(res.data) ? res.data : []
    emit('count-changed', commentsList.value.length)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleSubmit(content) {
  try {
    const res = await commentsApi.create(props.postId, content)
    commentsList.value.unshift(res)
    emit('count-changed', commentsList.value.length)
  } catch (e) {
    console.error(e)
  }
}

async function handleDelete(id) {
  try {
    await commentsApi.delete(id)
    commentsList.value = commentsList.value.filter(c => c.id !== id)
    emit('count-changed', commentsList.value.length)
  } catch (e) {
    console.error(e)
  }
}

function handleUpdate(updatedComment) {
  const idx = commentsList.value.findIndex(c => c.id === updatedComment.id)
  if (idx !== -1) {
    // Merge the updated comment to preserve nested objects like .user
    commentsList.value[idx] = { ...commentsList.value[idx], ...updatedComment }
  }
}

onMounted(loadComments)
</script>
<template>
  <div class="flex flex-col gap-4">
    <PostCommentForm @submit="handleSubmit" />
    <div v-if="loading" class="text-xs text-white/30 text-center py-4 animate-pulse">LOADING COMMENTS...</div>
    <div v-else-if="commentsList.length === 0" class="text-xs text-white/30 text-center py-4">NO COMMENTS YET</div>
    <div v-else class="flex flex-col">
      <PostCommentItem v-for="c in commentsList" :key="c.id" :comment="c" @delete="handleDelete" @update="handleUpdate" />
    </div>
  </div>
</template>
