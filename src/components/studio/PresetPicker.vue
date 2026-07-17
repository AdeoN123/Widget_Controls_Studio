<script setup lang="ts">
import { computed } from 'vue'
import { getAllControlPresets, getMatchingControlPresets } from '@/modules/control-presets'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import { useWidgetStudioStore } from '@/stores/widgetStudioStore'
import { usePresetsStore } from '@/stores/presetsStore'
import BaseButton from '@/components/UI/BaseButton.vue'

const blockStore = useWidgetBlockStore()
const studio = useWidgetStudioStore()
const presetsStore = usePresetsStore()

const suggested = computed(() => {
  if (!blockStore.selectedField) return []
  return getMatchingControlPresets(blockStore.selectedField)
})

function apply(presetId: string) {
  studio.applyControlPresetToSelection(presetId)
}

function saveAsPreset() {
  if (!blockStore.selectedControl) return
  const title = prompt('Название пресета', blockStore.selectedControl.name) ?? 'Пользовательский пресет'
  presetsStore.saveControlAsPreset(blockStore.selectedControl, title)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label class="flex flex-col gap-1">
      <span class="font-mono text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">Пресет контрола</span>
      <select
        class="rounded-sm border border-hairline bg-input px-2 py-1.5 text-[12px] text-[var(--color-text)] outline-none focus:border-accent"
        @change="apply(($event.target as HTMLSelectElement).value)"
      >
        <option value="">— применить пресет —</option>
        <option v-for="p in getAllControlPresets()" :key="p.id" :value="p.id">{{ p.title }}</option>
      </select>
    </label>

    <div v-if="suggested.length" class="flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--color-text-dim)]">
      <span>Похожие:</span>
      <button
        v-for="p in suggested"
        :key="p.id"
        type="button"
        class="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] text-accent"
        @click="apply(p.id)"
      >
        {{ p.title }}
      </button>
    </div>

    <div class="flex gap-3 text-[11px] text-[var(--color-text-muted)]">
      <label class="flex items-center gap-1"><input v-model="presetsStore.presetApplyMode" type="radio" value="merge" /> Слияние</label>
      <label class="flex items-center gap-1"><input v-model="presetsStore.presetApplyMode" type="radio" value="replace" /> Замена</label>
    </div>

    <BaseButton v-if="blockStore.selectedControl" size="sm" variant="ghost" @click="saveAsPreset">
      Сохранить как пресет
    </BaseButton>
  </div>
</template>
