<script setup lang="ts">
import TopToolbar from '@/components/studio/TopToolbar.vue'
import HistoryPanel from '@/components/studio/HistoryPanel.vue'
</script>

<template>
  <div class="app-layout">
    <TopToolbar />
    <HistoryPanel />
    <main class="app-layout__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-layout__main {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
