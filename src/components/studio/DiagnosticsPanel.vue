<script setup lang="ts">
import { computed } from 'vue'
import BasePanel from '@/components/UI/BasePanel.vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import type { DiagnosticItem } from '@/types/diagnostics'

const store = useWidgetBlockStore()

const categories = computed(() => [
  { id: 'parse', label: 'Разбор', items: store.diagnosticsByCategory.parse },
  { id: 'controls', label: 'Контролы', items: store.diagnosticsByCategory.controls },
  { id: 'validation', label: 'Валидация', items: store.diagnosticsByCategory.validation },
  { id: 'normalize', label: 'Нормализация', items: store.diagnosticsByCategory.normalize },
  { id: 'export', label: 'Экспорт', items: store.diagnosticsByCategory.export },
])

const severityGroups = computed(() => [
  { id: 'errors', label: 'Ошибки', items: store.diagnosticsErrors },
  { id: 'warnings', label: 'Предупреждения', items: store.diagnosticsWarnings },
  { id: 'info', label: 'Инфо', items: store.diagnosticsInfo },
])

function onClick(item: DiagnosticItem) {
  store.selectDiagnostic(item)
}

function quickFix(item: DiagnosticItem) {
  if (item.code === 'MissingControl') {
    store.generateControlsAction()
  } else if (item.code === 'WrongGroup' || item.code === 'OrphanControl') {
    store.repairControlsAction()
  } else if (item.fieldKey) {
    store.selectField(item.fieldKey)
  }
}

function severityClass(severity: string): string {
  if (severity === 'error') return 'text-[var(--color-error)]'
  if (severity === 'warning') return 'text-[var(--color-warning)]'
  return 'text-[var(--color-info)]'
}
</script>

<template>
  <BasePanel title="Диагностика" no-padding class="max-h-[200px]">
    <div v-if="store.diagnostics.length === 0" class="p-3 text-center text-[12px] text-[var(--color-text-dim)]">
      Ошибок нет
    </div>

    <div v-else class="grid max-h-[170px] grid-cols-[1fr_auto] overflow-hidden">
      <section class="overflow-y-auto border-r border-hairline">
        <div v-for="group in severityGroups" :key="group.id">
          <h4 class="border-b border-hairline px-2.5 py-1.5 font-mono text-[10px] uppercase text-[var(--color-text-dim)]">
            {{ group.label }} ({{ group.items.length }})
          </h4>
          <ul>
            <li
              v-for="item in group.items"
              :key="item.id"
              class="flex cursor-pointer items-center gap-2 border-b border-hairline px-2.5 py-1 text-[11px] hover:bg-panel-elevated"
              @click="onClick(item)"
            >
              <span class="shrink-0 font-mono text-[10px]" :class="severityClass(item.severity)">{{ item.code }}</span>
              <span class="flex-1 text-[var(--color-text-muted)]">{{ item.message }}</span>
              <BaseButton size="sm" variant="ghost" @click.stop="quickFix(item)">Исправить</BaseButton>
            </li>
          </ul>
        </div>
      </section>

      <section class="p-2 text-[10px] text-[var(--color-text-dim)]">
        <div v-for="cat in categories" :key="cat.id" class="px-2.5 py-1.5">
          <h4 class="font-mono uppercase">{{ cat.label }} · {{ cat.items.length }}</h4>
        </div>
      </section>
    </div>
  </BasePanel>
</template>
