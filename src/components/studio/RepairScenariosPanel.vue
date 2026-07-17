<script setup lang="ts">
import BasePanel from '@/components/UI/BasePanel.vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import { listRepairScenarios } from '@/modules/repair-scenarios'
import { useWidgetStudioStore } from '@/stores/widgetStudioStore'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'

const studio = useWidgetStudioStore()
const blockStore = useWidgetBlockStore()

const scenarios = listRepairScenarios()

function previewCount(id: string): number {
  const s = scenarios.find((x) => x.id === id)
  if (!s || !blockStore.parsedBlock) return 0
  return s.previewCount(blockStore.parsedBlock, blockStore.controls, { scope: 'block' })
}

function apply(id: string) {
  studio.runScenario(id)
}
</script>

<template>
  <BasePanel title="Быстрые исправления" no-padding class="max-h-[200px]">
    <ul class="list-none">
      <li
        v-for="scenario in scenarios"
        :key="scenario.id"
        class="flex items-center justify-between gap-2 border-b border-hairline px-3 py-2"
      >
        <div class="flex flex-col gap-0.5 text-xs">
          <strong>{{ scenario.title }}</strong>
          <span v-if="scenario.description" class="text-[10px] text-[var(--color-text-dim)]">{{ scenario.description }}</span>
          <span class="text-[10px] text-accent">~{{ previewCount(scenario.id) }} затронуто</span>
        </div>
        <BaseButton size="sm" @click="apply(scenario.id)">Применить</BaseButton>
      </li>
    </ul>
  </BasePanel>
</template>
