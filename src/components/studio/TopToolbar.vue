<script setup lang="ts">
import BaseButton from '@/components/UI/BaseButton.vue'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import { useEditorStore } from '@/stores/editorStore'
import { useWidgetStudioStore } from '@/stores/widgetStudioStore'
import { useAuditStore } from '@/stores/auditStore'
import { useCompareStore } from '@/stores/compareStore'

const store = useWidgetBlockStore()
const editorStore = useEditorStore()
const studio = useWidgetStudioStore()
const auditStore = useAuditStore()
const compareStore = useCompareStore()

async function handleExport() {
  const result = store.exportBlock()
  await navigator.clipboard.writeText(result).catch(() => {})
}

function applyTypographyPreset() {
  const sectionId = store.selectedSectionId
  if (!sectionId?.startsWith('style-')) return
  const title = sectionId.replace('style-', '')
  studio.applyParameterPresetToSection('typography_title', title)
}
</script>

<template>
  <header
    class="sticky top-0 z-50 flex shrink-0 items-start justify-between gap-3 border-b border-hairline bg-panel px-4 py-2"
  >
    <div class="flex shrink-0 items-center gap-2.5">
      <span
        class="flex h-8 w-8 items-center justify-center rounded-sm border border-signal/40 bg-ink font-display text-sm font-semibold text-signal"
      >
        W
      </span>
      <div>
        <div class="font-display text-sm font-semibold text-[var(--color-text)]">Widget Controls Studio</div>
        <div class="font-mono text-[10px] tracking-wide text-[var(--color-text-dim)]">BUILD&nbsp;5.0.0</div>
      </div>
      <span
        v-if="store.isDirty || editorStore.hasUnsavedChanges"
        class="rounded-sm border border-signal/40 bg-signal/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-signal"
      >
        unsaved
      </span>
    </div>

    <div class="flex flex-wrap justify-end gap-3">
      <div class="flex flex-wrap items-center gap-1 rounded-sm border border-hairline bg-panel-elevated px-2 py-1">
        <span class="mr-1 font-mono text-[9px] uppercase tracking-wide text-[var(--color-text-dim)]">Контролы</span>
        <BaseButton size="sm" @click="studio.showBulkEditCenter = true">Массовое редактирование</BaseButton>
        <BaseButton size="sm" @click="store.generateControlsAction()">Сгенерировать недостающие</BaseButton>
        <BaseButton size="sm" @click="studio.runScenario('rebuild-control-names')">Пересобрать названия</BaseButton>
        <BaseButton size="sm" @click="studio.showRepairPanel = !studio.showRepairPanel">Восстановить</BaseButton>
        <BaseButton size="sm" @click="studio.runScenario('remove-orphan-controls')">Удалить сироты</BaseButton>
      </div>

      <div class="flex flex-wrap items-center gap-1 rounded-sm border border-hairline bg-panel-elevated px-2 py-1">
        <span class="mr-1 font-mono text-[9px] uppercase tracking-wide text-[var(--color-text-dim)]">Параметры</span>
        <BaseButton size="sm" @click="applyTypographyPreset">Пресет параметров</BaseButton>
        <BaseButton size="sm" @click="store.normalizeBlock()">Нормализовать</BaseButton>
      </div>

      <div class="flex flex-wrap items-center gap-1 rounded-sm border border-hairline bg-panel-elevated px-2 py-1">
        <span class="mr-1 font-mono text-[9px] uppercase tracking-wide text-[var(--color-text-dim)]">Сравнение</span>
        <BaseButton size="sm" @click="compareStore.openCompareMode(); studio.showComparePanel = true">Сравнить</BaseButton>
        <BaseButton size="sm" @click="auditStore.toggleAuditMode()">Аудит</BaseButton>
      </div>

      <div class="flex flex-wrap items-center gap-1 rounded-sm border border-hairline bg-panel-elevated px-2 py-1">
        <BaseButton size="sm" @click="editorStore.showImportModal = true">Импорт</BaseButton>
        <BaseButton size="sm" :disabled="!editorStore.canUndo" @click="editorStore.undo()">Отменить</BaseButton>
        <BaseButton size="sm" :disabled="!editorStore.canRedo" @click="editorStore.redo()">Повторить</BaseButton>
        <BaseButton size="sm" variant="ghost" @click="editorStore.showHistoryPanel = !editorStore.showHistoryPanel">История</BaseButton>
        <BaseButton size="sm" variant="ghost" @click="editorStore.toggleTheme()">{{ editorStore.theme === 'dark' ? '☀' : '🌙' }}</BaseButton>
        <BaseButton variant="primary" size="sm" @click="handleExport">Экспорт</BaseButton>
      </div>
    </div>
  </header>
</template>
