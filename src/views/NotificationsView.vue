<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ─── State ────────────────────────────────────────────────
const activeFilter = ref('all')
const headerIn     = ref(false)
const contentIn    = ref(false)

const filters = [
  { key: 'all',      label: 'All'      },
  { key: 'mentions', label: 'Mentions' },
  { key: 'faves',    label: 'Faves'    },
  { key: 'replies',  label: 'Replies'  },
  { key: 'watch',    label: 'Watch'    },
]

// ─── Notification data ────────────────────────────────────
const groups = ref([
  {
    label: 'NEW ACTIVITY',
    items: [
      {
        id: 1, type: 'fave', read: false,
        user: 'cyber_soul',
        action: 'favorited your work',
        target: 'Neon Genesis',
        time: '2 MINUTES AGO',
        artGradient: 'linear-gradient(135deg, #1a0800 0%, #3a1400 50%, #c04010 100%)',
        showWatchBack: false,
        comment: null,
      },
      {
        id: 2, type: 'watch', read: false,
        user: 'vanguard_vfx',
        action: 'started watching you',
        target: null,
        time: '1 HOUR AGO',
        artGradient: null,
        showWatchBack: true,
        comment: null,
        watchingBack: ref(false),
      },
      {
        id: 3, type: 'reply', read: false,
        user: 'luna_art',
        action: 'commented:',
        target: null,
        time: '3 HOURS AGO',
        artGradient: 'linear-gradient(135deg, #1a1005 0%, #3a2510 50%, #c08030 100%)',
        showWatchBack: false,
        comment: '"The texture work here is incredible! Really loving the kinetic energy."',
        replyOpen: ref(false),
      },
    ],
  },
  {
    label: 'YESTERDAY',
    items: [
      {
        id: 4, type: 'fave', read: true,
        user: 'arch_void',
        othersCount: 4,
        action: 'favorited your work',
        target: null,
        time: '18 HOURS AGO',
        artGradient: 'linear-gradient(135deg, #1a0505 0%, #3a0808 50%, #801010 100%)',
        showWatchBack: false,
        comment: null,
      },
      {
        id: 5, type: 'mention', read: true,
        user: 'CyberPulse_Art',
        action: 'mentioned you in a comment on',
        target: '"The Neon District v.2"',
        time: '5 HOURS AGO',
        artGradient: 'linear-gradient(135deg, #051505 0%, #0a2510 50%, #05cc47 100%)',
        showWatchBack: false,
        comment: '"Hey @User, I absolutely love the volumetric lighting in this piece."',
      },
      {
        id: 6, type: 'reply', read: true,
        user: 'ArtDirector_X',
        action: 'replied to your comment',
        target: null,
        time: '12 MINUTES AGO',
        artGradient: 'linear-gradient(135deg, #100520 0%, #200840 50%, #8030c0 100%)',
        showWatchBack: false,
        comment: '"Your use of contrast here is stunning. How many layers did this take?"',
        yourReply: '"Thanks for noticing! It\'s actually about 120 layers."',
      },
    ],
  },
])

// ─── Derived ──────────────────────────────────────────────
const totalNew = computed(() =>
  groups.value.flatMap(g => g.items).filter(n => !n.read).length
)

const filteredGroups = computed(() => {
  if (activeFilter.value === 'all') return groups.value
  return groups.value.map(g => ({
    ...g,
    items: g.items.filter(n => n.type === activeFilter.value),
  })).filter(g => g.items.length > 0)
})

// ─── Icon + color per type ────────────────────────────────
const typeConfig = {
  fave:    { icon: 'favorite',      color: '#05cc47' },
  watch:   { icon: 'person_add',    color: '#05cc47' },
  reply:   { icon: 'chat_bubble',   color: '#05cc47' },
  mention: { icon: 'alternate_email', color: '#05cc47' },
}

function markAllRead() {
  groups.value.forEach(g => g.items.forEach(n => { n.read = true }))
}

function markRead(item) { item.read = true }

onMounted(() => {
  setTimeout(() => { headerIn.value = true  }, 80)
  setTimeout(() => { contentIn.value = true }, 250)
})
</script>

<template>
  <div class="notif-root min-h-screen text-white" style="background: #0d0e14; font-family: 'Inter', sans-serif;">

    <!-- ═══════════════════════════════════════
         DESKTOP TOP NAVBAR
    ═══════════════════════════════════════ -->
    <nav class="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center gap-6 px-8 h-14
      border-b border-white/[0.07]"
      style="background: rgba(10,11,16,0.95); backdrop-filter: blur(20px);">

      <!-- Brand + Links -->
      <div class="flex items-center gap-6 flex-shrink-0">
        <span class="brand font-black text-xl tracking-tight italic cursor-pointer"
          style="background: linear-gradient(135deg,#05cc47,#04a038); -webkit-background-clip:text; -webkit-text-fill-color:transparent;"
          @click="router.push('/')">
          KINETIC GALLERY
        </span>
        <div class="flex gap-1">
          <a v-for="l in ['Deviants','Groups','Shop']" :key="l" href="#"
            class="px-4 py-2 text-sm font-bold text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200">
            {{ l }}
          </a>
        </div>
      </div>

      <!-- Search -->
      <div class="flex-1 max-w-sm">
        <div class="relative">
          <span class="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm">search</span>
          <input type="text" placeholder="Search..."
            class="w-full pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 rounded-lg outline-none transition-all duration-200"
            style="background: rgba(255,255,255,0.04); border: 1px solid rgba(227,225,235,0.12);" />
        </div>
      </div>

      <!-- Right -->
      <div class="flex items-center gap-3 ml-auto flex-shrink-0">
        <button class="px-4 py-2 rounded-lg font-black text-xs tracking-widest text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(5,204,71,0.4)]"
          style="background: #05cc47;">
          Submit
        </button>
        <button class="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style="background: rgba(255,255,255,0.05); border: 1px solid rgba(227,225,235,0.12);">
          <span class="material-symbols-rounded icon-filled text-primary text-xl">notifications</span>
          <span v-if="totalNew > 0" class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-[9px] font-black flex items-center justify-center"
            style="background: #05cc47; color: #000;">{{ totalNew }}</span>
        </button>
        <button class="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style="background: rgba(255,255,255,0.05); border: 1px solid rgba(227,225,235,0.12);">
          <span class="material-symbols-rounded text-white/50 text-xl">mail</span>
        </button>
        <div class="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
          style="background: rgba(255,255,255,0.05); border: 2px solid rgba(5,204,71,0.3);">
          <span class="material-symbols-rounded icon-filled text-white/30">person</span>
        </div>
      </div>
    </nav>

    <!-- ═══════════════════════════════════════
         PAGE LAYOUT
    ═══════════════════════════════════════ -->
    <div class="flex md:pt-14 pb-20 md:pb-0 min-h-screen">

      <!-- ── Desktop Left Sidebar ── -->
      <aside class="hidden md:flex flex-col fixed top-14 left-0 bottom-0 w-56 z-40
        border-r border-white/[0.07]"
        style="background: #0a0b10;">

        <!-- Creator Hub -->
        <div class="m-4 p-4 rounded-xl border border-white/[0.07] cursor-pointer hover:border-primary/30 transition-colors"
          style="background: rgba(255,255,255,0.03);">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center"
              style="background: rgba(5,204,71,0.1); border: 1px solid rgba(5,204,71,0.2);">
              <span class="material-symbols-rounded icon-filled text-primary">shield</span>
            </div>
            <div>
              <p class="text-sm font-black text-white/80 tracking-wide">Creator Hub</p>
              <p class="text-xs font-bold text-primary/70 tracking-wider">PRO ACCOUNT</p>
            </div>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex flex-col gap-0.5 px-3 flex-1">
          <router-link v-for="item in [
            { to:'/',              icon:'home',          label:'Home'          },
            { to:'/discover',      icon:'explore',       label:'Discovery'     },
            { to:'/notifications', icon:'notifications', label:'Notifications', active: true },
            { to:'/library',       icon:'grid_view',     label:'Library'       },
            { to:'/settings',      icon:'settings',      label:'Settings'      },
          ]" :key="item.to" :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 group"
            :class="item.active
              ? 'text-primary'
              : 'text-white/40 hover:text-white hover:bg-white/5'">
            <span class="material-symbols-rounded icon-filled text-xl transition-transform duration-200 group-hover:scale-110">
              {{ item.icon }}
            </span>
            {{ item.label }}
          </router-link>
        </nav>

        <!-- Go Premium -->
        <div class="mx-4 mb-4">
          <button class="w-full py-2.5 rounded-xl font-black text-xs tracking-widest text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(5,204,71,0.3)]"
            style="background: #05cc47;">
            GO PREMIUM
          </button>
        </div>

        <!-- Footer links -->
        <div class="px-6 pb-6 flex flex-col gap-2">
          <a href="#" class="flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors font-bold">
            <span class="material-symbols-rounded text-sm">help</span> Help
          </a>
          <a href="#" class="flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors font-bold">
            <span class="material-symbols-rounded text-sm">lock</span> Privacy
          </a>
        </div>
      </aside>

      <!-- ── MAIN CONTENT ── -->
      <main class="flex-1 md:ml-56 w-full">

        <!-- Mobile Top Bar -->
        <header class="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14
          border-b border-white/[0.07]"
          style="background: rgba(10,11,16,0.97); backdrop-filter: blur(20px);">
          <div class="flex items-center gap-2">
            <span class="material-symbols-rounded icon-filled text-primary text-2xl">palette</span>
            <span class="brand font-black text-lg tracking-tight italic"
              style="background: linear-gradient(135deg,#05cc47,#04a038); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
              KINETIC
            </span>
          </div>
          <div class="relative">
            <span class="material-symbols-rounded icon-filled text-primary text-2xl">notifications</span>
            <span v-if="totalNew > 0"
              class="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center"
              style="background: #05cc47; color: #000;">{{ totalNew }}</span>
          </div>
        </header>

        <div class="pt-14 md:pt-0 px-4 md:px-10 max-w-3xl">

          <!-- ── Page Header ── -->
          <div class="py-6 md:py-8 transition-all duration-600"
            :class="headerIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'">

            <!-- Desktop heading + actions -->
            <div class="hidden md:flex items-start justify-between mb-1">
              <div>
                <h1 class="text-3xl font-black text-white tracking-tight">Notifications</h1>
                <p class="text-sm text-white/35 mt-1">
                  You have
                  <span class="text-primary font-bold">{{ totalNew }} new update{{ totalNew !== 1 ? 's' : '' }}</span>
                  since your last visit.
                </p>
              </div>
              <div class="flex gap-2">
                <button @click="markAllRead"
                  class="px-4 py-2 text-xs font-black tracking-widest text-white/50 rounded-xl transition-all duration-200 hover:text-white hover:bg-white/5"
                  style="border: 1px solid rgba(227,225,235,0.12);">
                  Mark all read
                </button>
                <button class="px-4 py-2 text-xs font-black tracking-widest text-white/50 rounded-xl transition-all duration-200 hover:text-white hover:bg-white/5"
                  style="border: 1px solid rgba(227,225,235,0.12);">
                  Filter Settings
                </button>
              </div>
            </div>

            <!-- Filter tabs ── unified mobile + desktop -->
            <div class="flex gap-1 mt-4 md:mt-6">
              <button v-for="f in filters" :key="f.key"
                @click="activeFilter = f.key"
                class="filter-tab px-4 py-2 rounded-lg text-sm font-black tracking-wide transition-all duration-200"
                :class="activeFilter === f.key
                  ? 'text-black'
                  : 'text-white/40 hover:text-white hover:bg-white/5 border border-white/[0.08]'"
                :style="activeFilter === f.key ? 'background: #05cc47; border: none;' : ''">
                {{ f.label }}
              </button>
            </div>
          </div>

          <!-- ── Notification Groups ── -->
          <div class="pb-10 space-y-8 transition-all duration-500"
            :class="contentIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">

            <TransitionGroup name="group-fade" tag="div" class="space-y-8">
              <div v-for="(group, gi) in filteredGroups" :key="group.label"
                :style="{ animationDelay: (gi * 80) + 'ms' }">

                <!-- Group label -->
                <p class="text-xs font-black tracking-widest text-white/25 mb-3 px-1">
                  {{ group.label }}
                </p>

                <!-- Items -->
                <TransitionGroup name="item-fade" tag="div" class="space-y-2">
                  <div v-for="(notif, ni) in group.items" :key="notif.id"
                    class="notif-card relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 group"
                    :class="notif.read ? '' : 'notif-unread'"
                    :style="{
                      background: 'rgba(255,255,255,0.03)',
                      border: notif.read ? '1px solid rgba(227,225,235,0.07)' : '1px solid rgba(5,204,71,0.15)',
                      animationDelay: (ni * 60 + gi * 100) + 'ms',
                    }"
                    @click="markRead(notif)">

                    <!-- Unread accent bar -->
                    <div v-if="!notif.read"
                      class="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                      style="background: #05cc47; box-shadow: 0 0 8px rgba(5,204,71,0.6);"></div>

                    <!-- Hover glow -->
                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style="background: radial-gradient(ellipse at 20% 50%, rgba(5,204,71,0.04) 0%, transparent 70%);"></div>

                    <div class="flex items-start gap-4 p-4 pl-5">

                      <!-- Avatar + type badge -->
                      <div class="relative flex-shrink-0">
                        <div class="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
                          style="background: rgba(255,255,255,0.05); border: 1px solid rgba(227,225,235,0.1);">
                          <span class="material-symbols-rounded icon-filled text-white/25 text-2xl">person</span>
                        </div>
                        <!-- Type badge -->
                        <div class="absolute -bottom-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                          style="background: #05cc47; border: 2px solid #0d0e14;">
                          <span class="material-symbols-rounded icon-filled text-black"
                            style="font-size: 12px;">
                            {{ typeConfig[notif.type]?.icon }}
                          </span>
                        </div>
                      </div>

                      <!-- Content -->
                      <div class="flex-1 min-w-0">
                        <p class="text-sm leading-relaxed text-white/75">
                          <span class="font-black text-white cursor-pointer hover:text-primary transition-colors">
                            {{ notif.user }}
                          </span>
                          <span v-if="notif.othersCount">
                            <span class="text-white/60"> and </span>
                            <span class="font-bold text-white">{{ notif.othersCount }} others</span>
                          </span>
                          {{ ' ' }}{{ notif.action }}{{ ' ' }}
                          <span v-if="notif.target" class="font-bold italic text-primary">{{ notif.target }}</span>
                        </p>

                        <!-- Comment quote -->
                        <p v-if="notif.comment"
                          class="mt-1.5 text-sm italic text-white/45 leading-relaxed">
                          {{ notif.comment }}
                        </p>

                        <!-- Reply thread -->
                        <div v-if="notif.yourReply"
                          class="mt-2 pl-3 border-l-2 border-white/10">
                          <p class="text-xs text-white/35 italic">{{ notif.yourReply }}</p>
                        </div>

                        <!-- Time -->
                        <p class="text-xs font-bold tracking-wider text-white/25 mt-2">{{ notif.time }}</p>

                        <!-- Watch Back CTA -->
                        <div v-if="notif.showWatchBack" class="mt-3">
                          <button
                            @click.stop="notif.watchingBack.value = !notif.watchingBack.value"
                            class="px-4 py-1.5 text-xs font-black tracking-widest rounded-lg transition-all duration-200"
                            :style="notif.watchingBack?.value
                              ? 'background: rgba(5,204,71,0.1); border: 1px solid rgba(5,204,71,0.3); color: #05cc47;'
                              : 'background: rgba(255,255,255,0.06); border: 1px solid rgba(227,225,235,0.15); color: rgba(255,255,255,0.6);'">
                            {{ notif.watchingBack?.value ? '✓ WATCHING' : 'WATCH BACK' }}
                          </button>
                        </div>

                        <!-- Reply + Like actions (for reply type) -->
                        <div v-if="notif.type === 'reply' && notif.yourReply" class="flex gap-4 mt-3">
                          <button class="flex items-center gap-1.5 text-xs font-black tracking-widest text-white/30 hover:text-primary transition-colors">
                            <span class="material-symbols-rounded text-sm">reply</span> REPLY
                          </button>
                          <button class="flex items-center gap-1.5 text-xs font-black tracking-widest text-white/30 hover:text-primary transition-colors">
                            <span class="material-symbols-rounded text-sm">thumb_up</span> LIKE
                          </button>
                        </div>
                      </div>

                      <!-- Art thumbnail + time (desktop) -->
                      <div class="flex flex-col items-end gap-2 flex-shrink-0">
                        <span class="hidden md:block text-xs font-bold text-white/25 whitespace-nowrap">
                          {{ notif.time.toLowerCase().replace(' ago','') }} ago
                        </span>

                        <div v-if="notif.artGradient"
                          class="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                          :style="{ background: notif.artGradient }">
                          <!-- Mini art vis -->
                          <div class="w-full h-full relative">
                            <div class="absolute inset-0 scanlines opacity-20"></div>
                            <div class="absolute inset-0"
                              style="background: radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.06), transparent)"></div>
                          </div>
                        </div>

                        <!-- More menu (only on desktop, for certain items) -->
                        <button v-if="notif.type === 'reply' && !notif.yourReply"
                          class="hidden md:flex w-7 h-7 items-center justify-center rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-all">
                          <span class="material-symbols-rounded text-lg">more_vert</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </TransitionGroup>
              </div>
            </TransitionGroup>

            <!-- Empty state -->
            <div v-if="filteredGroups.length === 0"
              class="flex flex-col items-center justify-center py-24 text-center">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style="background: rgba(255,255,255,0.03); border: 1px solid rgba(227,225,235,0.08);">
                <span class="material-symbols-rounded text-white/15 text-3xl">notifications_off</span>
              </div>
              <p class="text-sm font-black tracking-widest text-white/25">NO NOTIFICATIONS</p>
              <p class="text-xs text-white/15 mt-1">Nothing in this category yet</p>
            </div>

            <!-- View Older Activity -->
            <div v-if="filteredGroups.length > 0" class="flex justify-center pt-4 pb-8">
              <button class="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black tracking-widest
                text-white/40 transition-all duration-300 hover:text-white/70 hover:bg-white/5"
                style="border: 1px solid rgba(227,225,235,0.1);">
                View Older Activity
                <span class="material-symbols-rounded text-xl">expand_more</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- ═══════════════════════════════════════
         MOBILE BOTTOM NAV
    ═══════════════════════════════════════ -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50
      flex items-center justify-around px-2 py-2
      border-t border-white/[0.07]"
      style="background: rgba(10,11,16,0.97); backdrop-filter: blur(20px);">
      <router-link v-for="item in [
        { to:'/',              icon:'home',         label:'HOME'    },
        { to:'/explore',       icon:'search',       label:'SEARCH'  },
        { to:'/submit',        icon:'add_circle',   label:'CREATE'  },
        { to:'/notifications', icon:'notifications',label:'ALERTS',  active: true },
        { to:'/profile',       icon:'person',       label:'PROFILE' },
      ]" :key="item.to" :to="item.to"
        class="flex flex-col items-center gap-0.5 px-3 py-1.5 font-black text-[9px] tracking-wider transition-all duration-200 relative"
        :class="item.active ? 'text-primary' : 'text-white/30'">
        <span class="material-symbols-rounded icon-filled text-2xl"
          :class="item.active ? 'scale-110' : ''">{{ item.icon }}</span>
        {{ item.label }}
        <span v-if="item.active && totalNew > 0"
          class="absolute top-1 right-2.5 min-w-[14px] h-[14px] rounded-full text-[7px] font-black flex items-center justify-center"
          style="background: #05cc47; color: #000;">{{ totalNew }}</span>
      </router-link>
    </nav>

  </div>
</template>

<style scoped>
/* ─── Unread card shimmer ─── */
.notif-unread {
  animation: card-in 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes card-in {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ─── Group fade ─── */
.group-fade-enter-active { transition: all 0.4s ease; }
.group-fade-enter-from   { opacity: 0; transform: translateY(10px); }

/* ─── Item fade ─── */
.item-fade-enter-active { transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.item-fade-enter-from   { opacity: 0; transform: translateX(-8px); }
.item-fade-leave-active { transition: all 0.25s ease; }
.item-fade-leave-to     { opacity: 0; transform: translateX(8px); height: 0; }

/* ─── Card hover ─── */
.notif-card:hover {
  border-color: rgba(5, 204, 71, 0.2) !important;
  transform: translateX(2px);
}

/* ─── Scanlines on thumbnails ─── */
.scanlines {
  background: repeating-linear-gradient(
    to bottom, transparent, transparent 2px,
    rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px
  );
}

/* ─── Filter tab ─── */
.filter-tab { white-space: nowrap; }

/* ─── Primary color (text utility) ─── */
.text-primary  { color: #05cc47; }
.border-primary { border-color: #05cc47; }
.bg-primary    { background: #05cc47; }
</style>