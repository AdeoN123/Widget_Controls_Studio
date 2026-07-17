<script setup lang="ts">
import { ref, watch, toRefs } from 'vue'
import { useMonacoEditor } from './useMonacoEditor'
import type { EditorDiagnostic, EditorLanguage } from '@/modules/editor/types'

const props = withDefaults(
  defineProps<{
    modelValue: string
    language?: EditorLanguage
    readonly?: boolean
    height?: string
    diagnostics?: EditorDiagnostic[]
    formatOnMount?: boolean
    formatOnPaste?: boolean
  }>(),
  {
    language: 'plaintext',
    readonly: false,
    height: '100%',
    diagnostics: () => [],
    formatOnMount: false,
    formatOnPaste: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  save: []
  'focus-field': [payload: { line: number }]
  focus: []
  blur: []
}>()

const container = ref<HTMLElement | null>(null)
const propsRefs = toRefs(props)

const { setTheme } = useMonacoEditor(container, propsRefs, emit)

watch(
  () => document.documentElement.getAttribute('data-theme'),
  (theme) => setTheme(theme === 'light'),
)
</script>

<template>
  <div class="monaco-editor-host" :style="{ height }">
    <div ref="container" class="monaco-editor-host__container" />
  </div>
</template>

<style scoped>
.monaco-editor-host {
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.monaco-editor-host__container {
  width: 100%;
  height: 100%;
}
</style>
