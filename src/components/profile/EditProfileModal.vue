<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  showEditModal: { type: Boolean, default: false },
  profile: { type: Object, required: true },
  avatarPreview: { type: String, default: null },
  avatarUploading: { type: Boolean, default: false },
  bioSaving: { type: Boolean, default: false },
  initialBio: { type: String, default: '' },
})

const emit = defineEmits(['close', 'save', 'trigger-avatar-upload'])

const editBio = ref(props.initialBio)

watch(() => props.initialBio, (newVal) => {
  editBio.value = newVal
})

function handleSave() {
  emit('save', editBio.value)
}
</script>

<template>
  <Transition name="modal">
    <div v-if="showEditModal" class="fixed inset-0 z-[90] flex items-center justify-center p-4"
      @click.self="$emit('close')">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')"></div>

      <!-- Modal content -->
      <div class="edit-modal relative z-10 w-full max-w-lg rounded-2xl
        border border-border bg-surface/95 backdrop-blur-xl
        shadow-2xl shadow-black/50 overflow-hidden">

        <!-- Modal header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <div class="flex items-center gap-3">
            <i class="bi bi-pencil-fill text-primary text-xl"></i>
            <h2 class="text-sm font-black tracking-widest text-white">EDIT PROFILE</h2>
          </div>
          <button @click="$emit('close')"
            class="w-8 h-8 rounded-lg flex items-center justify-center
              text-white/30 hover:text-white/70 hover:bg-white/5 transition-all duration-200">
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <!-- Avatar section in modal -->
        <div class="px-6 pt-5 pb-4 border-b border-border/50">
          <label class="text-white/30 font-bold tracking-wider text-xs block mb-3">PROFILE PICTURE</label>
          <div class="flex items-center gap-4">
            <div class="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/40
              bg-surface flex items-center justify-center cursor-pointer group/modal-avatar"
              @click="$emit('trigger-avatar-upload')">
              <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover" />
              <img v-else-if="profile.avatar_url" :src="profile.avatar_url" class="w-full h-full object-cover" />
              <i v-else class="bi bi-person-fill text-white/30 text-2xl"></i>
              <div class="absolute inset-0 bg-black/50 flex items-center justify-center
                opacity-0 group-hover/modal-avatar:opacity-100 transition-opacity duration-200">
                <i v-if="avatarUploading" class="bi bi-arrow-repeat text-white text-lg animate-spin"></i>
                <i v-else class="bi bi-camera-fill text-white text-lg"></i>
              </div>
            </div>
            <div>
              <button @click="$emit('trigger-avatar-upload')" :disabled="avatarUploading"
                class="text-xs font-bold tracking-wider text-primary hover:text-primary/80
                  transition-colors duration-200 disabled:opacity-50">
                {{ avatarUploading ? 'UPLOADING...' : 'CHANGE PHOTO' }}
              </button>
              <p class="text-[10px] text-white/25 mt-1">JPEG, PNG, or WebP · Max 2 MB</p>
            </div>
          </div>
        </div>

        <!-- Bio section in modal -->
        <div class="px-6 pt-4 pb-5">
          <div class="flex items-center justify-between mb-2">
            <label for="bio-textarea" class="text-white/30 font-bold tracking-wider text-xs">BIO</label>
            <span class="text-[10px] font-bold tracking-wider"
              :class="editBio.length > 450 ? 'text-red-400' : 'text-white/20'">
              {{ editBio.length }} / 500
            </span>
          </div>
          <textarea
            id="bio-textarea"
            v-model="editBio"
            placeholder="Tell the world about yourself..."
            rows="4"
            maxlength="500"
            class="bio-input w-full bg-dark/60 border border-border rounded-xl px-4 py-3
              text-sm text-white placeholder-white/20 resize-none outline-none
              focus:border-primary/50 focus:bg-dark/80 transition-all duration-200"
          ></textarea>
          <p class="text-[10px] text-white/20 mt-1.5">Your bio is visible on your public profile.</p>
        </div>

        <!-- Modal footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-dark/30">
          <button @click="$emit('close')"
            class="px-5 py-2.5 rounded-lg text-xs font-black tracking-widest
              text-white/50 hover:text-white/80 bg-surface border border-border
              hover:border-white/20 transition-all duration-200">
            CANCEL
          </button>
          <button @click="handleSave" :disabled="bioSaving"
            class="px-6 py-2.5 rounded-lg text-xs font-black tracking-widest
              bg-primary text-black hover:bg-primary/90
              transition-all duration-200 flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg shadow-primary/20">
            <i v-if="bioSaving" class="bi bi-arrow-repeat text-sm animate-spin"></i>
            <i v-else class="bi bi-save text-sm"></i>
            {{ bioSaving ? 'SAVING...' : 'SAVE CHANGES' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
