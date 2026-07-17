<template>
  <div
    v-if="editorStore.showHistoryPanel"
    class="fixed right-4 top-[calc(var(--header-height)+8px)] z-[200] max-h-[360px] w-[min(320px,90vw)] overflow-auto rounded-md border border-hairline-strong bg-panel shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
  >
    <header class="flex items-center justify-between border-b border-hairline px-3 py-2.5">
      <h3 class="text-[13px] font-semibold">История</h3>
      <button
        type="button"
        class="text-lg text-[var(--color-text-muted)]"
        @click="editorStore.showHistoryPanel = false"
      >
        ×
      </button>
    </header>

    <div class="flex gap-1.5 border-b border-hairline px-3 py-2">
      <BaseButton size="sm" :disabled="!canUndo" @click="undo">Отменить</BaseButton>
      <BaseButton size="sm" :disabled="!canRedo" @click="redo">Повторить</BaseButton>
    </div>

    <ul v-if="entries.length" class="list-none">
      <li v-for="entry in entries" :key="entry.id" class="border-b border-hairline px-3 py-2">
        <div class="text-xs font-medium">{{ entry.label }}</div>
        <div class="mt-0.5 flex justify-between gap-2 text-[10px] text-[var(--color-text-dim)]">
          <span>{{ formatTime(entry.timestamp) }}</span>
          <span class="text-right">{{ entry.diff.summary }}</span>
        </div>
      </li>
    </ul>

    <p v-else class="px-3 py-4 text-center text-[11px] text-[var(--color-text-dim)]">
      Пока нет истории — изменения появятся здесь.
    </p>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/UI/BaseButton.vue'
import { useEditorStore } from '@/stores/editorStore'
import { useHistory } from '@/modules/history'

const editorStore = useEditorStore()
const { entries, canUndo, canRedo, undo, redo } = useHistory()

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString()
}
</script>
