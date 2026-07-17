<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import CodeEditor from '@/components/editors/CodeEditor.vue'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import { parseWidgetBlock } from '@/modules/widget-block/parser'

const emit = defineEmits<{ close: [] }>()

const blockStore = useWidgetBlockStore()
const importText = ref('')

const preview = computed(() => {
  if (!importText.value.trim()) return null
  return parseWidgetBlock(importText.value)
})

function apply() {
  if (!importText.value.trim()) return
  blockStore.importFromRaw(importText.value)
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60" @click.self="emit('close')">
    <div class="w-[min(720px,90vw)] overflow-hidden rounded-lg border border-hairline-strong bg-panel">
      <header class="flex items-center justify-between border-b border-hairline px-4 py-3">
        <h2 class="font-display text-sm font-semibold">Импорт исходного блока</h2>
        <button type="button" class="text-xl text-[var(--color-text-muted)]" @click="emit('close')">×</button>
      </header>

      <CodeEditor v-model="importText" language="plaintext" height="320px" />

      <div v-if="preview" class="flex gap-4 border-t border-hairline px-4 py-2 text-[11px] text-[var(--color-text-muted)]">
        <span>Контент: {{ preview.metadata.contentFieldsCount }}</span>
        <span>Стили: {{ preview.metadata.styleFieldsCount }}</span>
        <span>Ошибок: {{ preview.diagnostics.filter((d) => d.severity === 'error').length }}</span>
        <span>Предупр.: {{ preview.diagnostics.filter((d) => d.severity === 'warning').length }}</span>
      </div>

      <footer class="flex gap-2 border-t border-hairline px-4 py-3">
        <BaseButton variant="primary" size="sm" @click="apply">Применить</BaseButton>
        <BaseButton size="sm" variant="ghost" @click="emit('close')">Отмена</BaseButton>
      </footer>
    </div>
  </div>
</template>
