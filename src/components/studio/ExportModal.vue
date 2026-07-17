<script setup lang="ts">
import BaseButton from '@/components/UI/BaseButton.vue'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'

const emit = defineEmits<{ close: [] }>()
const store = useWidgetBlockStore()

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function copy(text: string) {
  await navigator.clipboard.writeText(text)
}

function copyBlock() {
  copy(store.exportBlock())
}

function copyControls() {
  copy(store.serializedControls)
}

function downloadBlock() {
  download('widget-block.txt', store.exportBlock())
}

function downloadControls() {
  download('widgets-controls.yaml', store.serializedControls)
}

function downloadObject() {
  download('block-object.json', store.objectViewJson)
}
</script>

<template>
  <div class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60" @click.self="emit('close')">
    <div class="w-[min(480px,90vw)] rounded-lg border border-hairline-strong bg-panel">
      <header class="flex items-center justify-between border-b border-hairline px-4 py-3">
        <h2 class="font-display text-sm font-semibold">Экспорт</h2>
        <button type="button" class="text-xl text-[var(--color-text-muted)]" @click="emit('close')">×</button>
      </header>

      <div class="flex flex-col gap-2 p-4">
        <BaseButton size="sm" @click="copyBlock">Скопировать блок</BaseButton>
        <BaseButton size="sm" @click="copyControls">Скопировать только контролы</BaseButton>
        <BaseButton size="sm" @click="downloadBlock">Скачать .txt</BaseButton>
        <BaseButton size="sm" @click="downloadControls">Скачать YAML контролов</BaseButton>
        <BaseButton size="sm" @click="downloadObject">Скачать JSON-объект</BaseButton>
      </div>

      <footer class="border-t border-hairline px-4 py-3">
        <BaseButton size="sm" variant="ghost" @click="emit('close')">Закрыть</BaseButton>
      </footer>
    </div>
  </div>
</template>
