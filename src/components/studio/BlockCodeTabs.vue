<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BasePanel from '@/components/UI/BasePanel.vue'
import BaseTabs from '@/components/UI/BaseTabs.vue'
import CodeEditor from '@/components/editors/CodeEditor.vue'
import DiffEditor from '@/components/editors/DiffEditor.vue'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import { useEditorStore } from '@/stores/editorStore'
import { useEditorSync } from '@/modules/editor/composables/useEditorSync'
import type { EditorDiagnostic } from '@/modules/editor/types'
import type { DiffMode } from '@/modules/editor/types'

const store = useWidgetBlockStore()
const editorStore = useEditorStore()
const { applyRawChange, applyObjectChange, applyControlsChange } = useEditorSync()

const activeTab = ref('raw')
const isFullscreen = ref(false)

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isFullscreen.value) isFullscreen.value = false
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))

const currentTabSource = computed(() => {
  if (activeTab.value === 'raw') return store.currentRaw
  if (activeTab.value === 'object') return store.objectViewJson
  if (activeTab.value === 'controls') return store.serializedControls
  return ''
})

const localValue = ref('')
watch(
  () => [activeTab.value, currentTabSource.value] as const,
  ([, v]) => {
    localValue.value = v
  },
  { immediate: true },
)

const currentTabLanguage = computed(() => {
  if (activeTab.value === 'object') return 'json'
  if (activeTab.value === 'controls') return 'yaml'
  return 'plaintext'
})

const tabs = computed(() => [
  { id: 'raw', label: 'Исходный текст' },
  { id: 'object', label: 'Объект' },
  { id: 'controls', label: 'YAML контролов' },
  { id: 'diff', label: 'Сравнение', badge: hasDiff.value ? 1 : undefined },
])

const diffModes: { id: DiffMode; label: string }[] = [
  { id: 'original-current', label: 'Исходный vs Текущий' },
  { id: 'before-normalize', label: 'Нормализация' },
  { id: 'before-repair', label: 'Восстановление' },
  { id: 'before-generate', label: 'Генерация' },
]

const hasDiff = computed(() => {
  const [a, b] = diffPair.value
  return a !== b
})

const diffPair = computed((): [string, string] => {
  switch (editorStore.diffMode) {
    case 'before-normalize':
      return [editorStore.beforeNormalizeRaw, editorStore.afterNormalizeRaw]
    case 'before-repair':
      return [editorStore.beforeRepairRaw, editorStore.afterRepairRaw]
    case 'before-generate':
      return [editorStore.beforeGenerateRaw, editorStore.afterGenerateRaw]
    default:
      return [store.originalRaw, store.currentRaw]
  }
})

const editorDiagnostics = computed((): EditorDiagnostic[] =>
  store.diagnostics.map((d, i) => ({
    line: i + 1,
    column: 1,
    message: d.message,
    severity: d.severity,
    code: d.code,
  })),
)

function onEditorUpdate(v: string) {
  localValue.value = v
  if (activeTab.value === 'raw') applyRawChange(v)
  else if (activeTab.value === 'object') applyObjectChange(v)
  else if (activeTab.value === 'controls') applyControlsChange(v)
}

function onEditorFocus() {
  editorStore.monacoFocused = true
}

function onEditorBlur() {
  editorStore.monacoFocused = false
}

function onSave() {
  store.exportBlock()
}
</script>

<template>
  <div
    :class="isFullscreen ? 'fixed inset-0 z-[300] bg-ink/95 p-4' : 'contents'"
  >
    <BasePanel no-padding class="h-full flex flex-col relative">
      <button
        type="button"
        :title="isFullscreen ? 'Свернуть (Esc)' : 'На весь экран'"
        class="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-sm border border-hairline bg-panel-elevated text-[13px] leading-none text-[var(--color-text-dim)] hover:text-signal"
        @click="toggleFullscreen"
      >
        {{ isFullscreen ? '⤡' : '⤢' }}
      </button>

      <BaseTabs v-model="activeTab" :tabs="tabs" />

      <div v-if="activeTab === 'diff'" class="flex flex-wrap gap-1 border-b border-hairline px-3 py-1.5">
        <button
          v-for="mode in diffModes"
          :key="mode.id"
          type="button"
          class="rounded-sm border px-2 py-0.5 text-[10px]"
          :class="editorStore.diffMode === mode.id
            ? 'border-accent text-accent'
            : 'border-hairline text-[var(--color-text-dim)]'"
          @click="editorStore.diffMode = mode.id"
        >
          {{ mode.label }}
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-hidden">
        <CodeEditor
          v-if="activeTab !== 'diff'"
          :model-value="localValue"
          :language="currentTabLanguage"
          :diagnostics="activeTab === 'raw' ? editorDiagnostics : []"
          @update:model-value="onEditorUpdate"
          @focus="onEditorFocus"
          @blur="onEditorBlur"
          @save="onSave"
        />
        <DiffEditor
          v-else
          :original="diffPair[0]"
          :modified="diffPair[1]"
          language="plaintext"
        />
      </div>

      <template #footer>
        <div class="flex flex-wrap gap-3 font-mono text-[10px] text-[var(--color-text-dim)]">
          <span>Формат: Widget Block</span>
          <span>{{ store.diagnosticsErrors.length }} ошибок</span>
          <span>{{ store.diagnosticsWarnings.length }} предупреждений</span>
          <span v-if="store.isDirty || editorStore.hasUnsavedChanges" class="text-signal">
            ● Изменено
          </span>
        </div>
      </template>
    </BasePanel>
  </div>
</template>
