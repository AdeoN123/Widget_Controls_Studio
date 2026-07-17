<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { loadMonaco } from '@/modules/editor/monaco/setup'

const props = withDefaults(
  defineProps<{
    original: string
    modified: string
    language?: string
    height?: string
  }>(),
  { language: 'plaintext', height: '100%' },
)

const container = ref<HTMLElement | null>(null)
let diffEditor: import('monaco-editor').editor.IStandaloneDiffEditor | null = null
let monaco: typeof import('monaco-editor') | null = null

async function init() {
  if (!container.value) return
  monaco = await loadMonaco()

  diffEditor = monaco.editor.createDiffEditor(container.value, {
    automaticLayout: true,
    readOnly: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    renderSideBySide: true,
    theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'vs' : 'vs-dark',
  })

  updateModels()
}

function updateModels() {
  if (!diffEditor || !monaco) return
  const lang = props.language
  diffEditor.setModel({
    original: monaco.editor.createModel(props.original, lang),
    modified: monaco.editor.createModel(props.modified, lang),
  })
}

onMounted(init)
onBeforeUnmount(() => diffEditor?.dispose())

watch(() => [props.original, props.modified], updateModels)
</script>

<template>
  <div class="diff-editor" :style="{ height }">
    <div ref="container" class="diff-editor__container" />
  </div>
</template>

<style scoped>
.diff-editor {
  width: 100%;
  min-height: 0;
}

.diff-editor__container {
  width: 100%;
  height: 100%;
}
</style>
