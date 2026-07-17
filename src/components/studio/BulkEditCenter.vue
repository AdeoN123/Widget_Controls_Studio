<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import { useSelectionStore } from '@/stores/selectionStore'
import { useWidgetStudioStore } from '@/stores/widgetStudioStore'
import { usePresetsStore } from '@/stores/presetsStore'
import { getAllControlPresets } from '@/modules/control-presets'
import { previewBulkControlPatch } from '@/modules/bulk-edit/services/bulkControls.service'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'

const emit = defineEmits<{ close: [] }>()

const selection = useSelectionStore()
const studio = useWidgetStudioStore()
const presetsStore = usePresetsStore()
const blockStore = useWidgetBlockStore()

const selectedPresetId = ref('')
const bulkGroup = ref('')
const builderKind = ref('design-desktop')

const selectedKeys = computed(() =>
  studio.bulkMode === 'controls'
    ? [...selection.selectedControlKeys]
    : [...selection.selectedFieldKeys],
)

const preview = computed(() => {
  if (studio.bulkMode !== 'controls' || !bulkGroup.value) return null
  return previewBulkControlPatch(blockStore.controls, selectedKeys.value, { group: bulkGroup.value })
})

function applyPreset() {
  if (!selectedPresetId.value) return
  studio.applyControlPresetToSelection(selectedPresetId.value)
}

function applyGroup() {
  if (!bulkGroup.value) return
  studio.bulkSetGroup(bulkGroup.value)
}
</script>

<template>
  <div class="fixed inset-0 z-[210] flex items-center justify-center bg-black/60" @click.self="emit('close')">
    <div class="max-h-[80vh] w-[min(560px,92vw)] overflow-auto rounded-lg border border-hairline-strong bg-panel">
      <header class="flex items-center gap-3 border-b border-hairline px-4 py-3">
        <h2 class="flex-1 font-display text-sm font-semibold">Массовое редактирование</h2>
        <div class="flex gap-1">
          <button
            type="button"
            class="rounded-sm border px-2.5 py-1 text-[11px]"
            :class="studio.bulkMode === 'controls' ? 'border-accent text-accent' : 'border-hairline text-[var(--color-text-muted)]'"
            @click="studio.bulkMode = 'controls'"
          >
            Контролы
          </button>
          <button
            type="button"
            class="rounded-sm border px-2.5 py-1 text-[11px]"
            :class="studio.bulkMode === 'fields' ? 'border-accent text-accent' : 'border-hairline text-[var(--color-text-muted)]'"
            @click="studio.bulkMode = 'fields'"
          >
            Параметры
          </button>
        </div>
        <button type="button" class="text-xl text-[var(--color-text-muted)]" @click="emit('close')">×</button>
      </header>

      <div class="p-4">
        <p class="mb-3 text-xs">Выбрано: {{ selectedKeys.length }}</p>

        <div v-if="preview" class="mb-3 rounded-sm bg-input p-2 text-[11px]">
          Предпросмотр: {{ preview.summary }} — {{ preview.keys.join(', ') }}
        </div>

        <section v-if="studio.bulkMode === 'controls'">
          <h3 class="mb-1.5 mt-3 text-[11px] uppercase text-[var(--color-text-dim)]">Пресет контрола</h3>
          <select v-model="selectedPresetId" class="mb-2 w-full rounded-sm border border-hairline bg-input p-1.5 text-[var(--color-text)]">
            <option value="">— выбрать пресет —</option>
            <option v-for="p in getAllControlPresets()" :key="p.id" :value="p.id">{{ p.title }}</option>
          </select>
          <label class="mr-3 text-xs">
            <input v-model="presetsStore.presetApplyMode" type="radio" value="merge" /> Слияние
          </label>
          <label class="text-xs">
            <input v-model="presetsStore.presetApplyMode" type="radio" value="replace" /> Замена
          </label>
          <div class="mt-2">
            <BaseButton size="sm" @click="applyPreset">Применить пресет</BaseButton>
          </div>

          <h3 class="mb-1.5 mt-3 text-[11px] uppercase text-[var(--color-text-dim)]">Задать группу</h3>
          <input v-model="bulkGroup" placeholder="Группа" class="mb-2 w-full rounded-sm border border-hairline bg-input p-1.5 text-[var(--color-text)]" />
          <BaseButton size="sm" @click="applyGroup">Применить группу</BaseButton>

          <h3 class="mb-1.5 mt-3 text-[11px] uppercase text-[var(--color-text-dim)]">Тип брейкпоинта</h3>
          <select v-model="builderKind" class="mb-2 w-full rounded-sm border border-hairline bg-input p-1.5 text-[var(--color-text)]">
            <option value="design-desktop">design-desktop</option>
            <option value="design-tablet">design-tablet</option>
            <option value="design-phone">design-phone</option>
          </select>
          <BaseButton
            size="sm"
            @click="blockStore.bulkSetBuilderKind(selectedKeys, builderKind as 'design-desktop')"
          >
            Применить builder_kind
          </BaseButton>

          <div class="mt-3 flex flex-wrap gap-1.5">
            <BaseButton size="sm" @click="blockStore.bulkAddValidate(selectedKeys)">+ validate</BaseButton>
            <BaseButton size="sm" @click="blockStore.bulkRemoveValidate(selectedKeys)">- validate</BaseButton>
            <BaseButton size="sm" @click="studio.bulkRebuildSelectedNames()">Пересобрать названия</BaseButton>
            <BaseButton size="sm" @click="studio.bulkRegenerateSelected()">Восстановить по умолчанию</BaseButton>
            <BaseButton size="sm" variant="danger" @click="studio.bulkDeleteSelectedControls()">Удалить</BaseButton>
          </div>
        </section>

        <section v-else>
          <h3 class="mb-1.5 mt-3 text-[11px] uppercase text-[var(--color-text-dim)]">Операции с параметрами</h3>
          <BaseButton size="sm" @click="blockStore.bulkGenerateControlsForFields(selectedKeys)">
            Сгенерировать контролы
          </BaseButton>
          <p class="mt-2 text-[11px] text-[var(--color-text-dim)]">Переименование / перенос — через Refactor Tools в инспекторе</p>
        </section>
      </div>
    </div>
  </div>
</template>
