<script setup lang="ts">
import BasePanel from '@/components/UI/BasePanel.vue'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'

const store = useWidgetBlockStore()

function sectionIcon(kind: string): string {
  switch (kind) {
    case 'required': return '⚙'
    case 'content': return '✎'
    case 'controls': return '⊞'
    default: return '◈'
  }
}
</script>

<template>
  <BasePanel title="Структура блока" no-padding class="h-full">
    <nav class="py-1">
      <template v-for="section in store.sections" :key="section.id">
        <button
          class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors"
          :class="store.selectedSectionId === section.id
            ? 'bg-accent/15 text-accent'
            : 'text-[var(--color-text-muted)] hover:bg-panel-elevated hover:text-[var(--color-text)]'"
          type="button"
          @click="store.selectSection(section.id)"
        >
          <span
            class="w-3 shrink-0 text-center text-[9px] transition-transform duration-150"
            :class="store.selectedSectionId === section.id ? 'rotate-90 text-accent' : 'text-[var(--color-text-dim)]'"
          >
            ›
          </span>
          <span class="w-4 text-center text-[11px]">{{ sectionIcon(section.kind) }}</span>
          <span class="flex-1 truncate">#{{ section.title }}</span>
          <span
            class="rounded-full px-1.5 py-0.5 text-[10px]"
            :class="store.selectedSectionId === section.id ? 'bg-accent/25 text-accent' : 'bg-panel-elevated text-[var(--color-text-dim)]'"
          >
            {{ section.count }}
          </span>
        </button>

        <div
          v-if="store.selectedSectionId === section.id && store.selectedSectionFields.length"
          class="flex flex-col py-1 pl-7"
        >
          <button
            v-for="field in store.selectedSectionFields"
            :key="field.key"
            class="truncate px-3 py-1 text-left font-mono text-[11px] transition-colors"
            :class="store.selectedFieldKey === field.key ? 'text-accent' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'"
            type="button"
            @click="store.selectField(field.key)"
          >
            {{ field.key }}
          </button>
        </div>
      </template>
    </nav>

    <template #footer>
      <div class="text-[11px] text-[var(--color-text-dim)]">
        <span>Всего параметров: {{ store.totalFieldCount }}</span>
      </div>
    </template>
  </BasePanel>
</template>
