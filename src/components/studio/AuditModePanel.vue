<script setup lang="ts">
import { computed } from 'vue'
import BasePanel from '@/components/UI/BasePanel.vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import { useAuditStore } from '@/stores/auditStore'
import type { AuditFilter } from '@/modules/audit'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import { useWidgetStudioStore } from '@/stores/widgetStudioStore'

const auditStore = useAuditStore()
const blockStore = useWidgetBlockStore()
const studio = useWidgetStudioStore()

const filters: { id: AuditFilter | 'all'; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'missing_controls', label: 'Нет контролов' },
  { id: 'orphan_controls', label: 'Сироты' },
  { id: 'numeric_without_validate', label: 'Числовые' },
  { id: 'file_without_config', label: 'Файлы' },
  { id: 'wrong_group', label: 'Не та группа' },
  { id: 'naming_anomaly', label: 'Именование' },
  { id: 'breakpoint_gap', label: 'Пропуск разрешения' },
]

const quickViews = computed(() => [
  { label: 'Поля без контролов', filter: 'missing_controls' as AuditFilter },
  { label: 'Битые контролы', filter: 'orphan_controls' as AuditFilter },
  { label: 'Числовые без валидации', filter: 'numeric_without_validate' as AuditFilter },
  { label: 'Файлы без конфига', filter: 'file_without_config' as AuditFilter },
])

function onItemClick(fieldKey?: string) {
  if (fieldKey) blockStore.selectField(fieldKey)
}

function fixItem(filter: AuditFilter) {
  const map: Record<string, string> = {
    missing_controls: 'generate-missing-controls',
    orphan_controls: 'remove-orphan-controls',
    numeric_without_validate: 'repair-numeric-controls',
    file_without_config: 'repair-file-controls',
    wrong_group: 'repair-groups',
    invalid_font_weight: 'repair-font-weight-controls',
  }
  const id = map[filter]
  if (id) studio.runScenario(id)
}
</script>

<template>
  <BasePanel title="Режим аудита" no-padding class="max-h-[220px]">
    <div class="flex flex-wrap gap-1 border-b border-hairline p-2">
      <button
        v-for="f in filters"
        :key="f.id"
        type="button"
        class="rounded-sm border px-2 py-0.5 text-[10px] transition-colors"
        :class="auditStore.activeFilter === f.id ? 'border-accent text-accent' : 'border-hairline text-[var(--color-text-muted)]'"
        @click="auditStore.setFilter(f.id)"
      >
        {{ f.label }}
        <span v-if="f.id !== 'all'">{{ auditStore.counts.get(f.id as AuditFilter) ?? 0 }}</span>
      </button>
    </div>

    <div class="flex flex-wrap gap-1 px-2 py-1.5">
      <button
        v-for="view in quickViews"
        :key="view.filter"
        type="button"
        class="rounded-sm bg-input px-2 py-0.5 text-[10px] text-[var(--color-text-muted)]"
        @click="auditStore.setFilter(view.filter)"
      >
        {{ view.label }}
      </button>
    </div>

    <ul class="max-h-[120px] list-none overflow-y-auto">
      <li
        v-for="item in auditStore.filteredItems"
        :key="item.id"
        class="flex cursor-pointer items-center gap-2 border-b border-hairline px-2.5 py-1 text-[11px]"
        @click="onItemClick(item.fieldKey)"
      >
        <span class="shrink-0 font-mono text-[9px] text-signal">{{ item.filter }}</span>
        <span class="min-w-0 flex-1 truncate">{{ item.message }}</span>
        <BaseButton size="sm" variant="ghost" @click.stop="fixItem(item.filter)">Исправить</BaseButton>
      </li>
    </ul>
  </BasePanel>
</template>
