<script setup lang="ts">
import { computed } from 'vue'
import BasePanel from '@/components/UI/BasePanel.vue'
import FormField from '@/components/UI/FormField.vue'
import FormSelect from '@/components/UI/FormSelect.vue'
import ControlPreview from '@/components/controls-preview/ControlPreview.vue'
import PresetPicker from '@/components/studio/PresetPicker.vue'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import type { ControlType, BuilderKind } from '@/modules/controls/types'

const store = useWidgetBlockStore()

const controlTypes: ControlType[] = [
  'textfield', 'textarea', 'wysiwyg', 'color', 'file', 'radio',
  'select', 'collection', 'range', 'checkbox', 'switch', 'fonts',
]

const builderKinds: BuilderKind[] = ['design-desktop', 'design-tablet', 'design-phone']

function updateField(field: string, value: string) {
  if (!store.selectedControl) return
  store.updateControl(store.selectedControl.key, { [field]: value })
}

function updateValidate(flag: 'required' | 'digits', checked: boolean) {
  if (!store.selectedControl) return
  const validate = { ...store.selectedControl.validate }
  if (checked) {
    validate[flag] = 'true'
  } else {
    delete validate[flag]
  }
  store.updateControl(store.selectedControl.key, { validate })
}

const validateJson = computed({
  get: () => JSON.stringify(store.selectedControl?.validate ?? {}, null, 2),
  set: (v: string) => {
    if (!store.selectedControl) return
    try {
      const parsed: unknown = JSON.parse(v)
      if (parsed && typeof parsed === 'object') {
        store.updateControl(store.selectedControl.key, {
          validate: parsed as { required?: 'true'; digits?: 'true' },
        })
      }
    } catch {
      return
    }
  },
})

const sectionLabel = computed(() => {
  const kind = store.selectedControl?.sourceSectionKind
  if (kind === 'style') return 'Стиль'
  if (kind === 'content') return 'Контент'
  return '—'
})
</script>

<template>
  <BasePanel no-padding class="inspector">
    <template #header>
      <div v-if="store.selectedControl" class="flex min-w-0 flex-1 items-center gap-2">
        <span class="shrink-0 rounded-sm border border-signal/30 bg-signal/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-signal">
          {{ store.selectedControl.type }}
        </span>
        <span class="truncate font-mono text-[11px] text-[var(--color-text-muted)]">{{ store.selectedControl.key }}</span>
      </div>
      <h3 v-else class="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        Контроль параметра
      </h3>
    </template>

    <div v-if="!store.selectedControl" class="p-4 text-center text-[12px] text-[var(--color-text-dim)]">
      Выберите параметр с контролом
    </div>

    <div v-else class="flex flex-col">
      <div class="border-b border-hairline p-3">
        <PresetPicker />
      </div>

      <section class="flex flex-col gap-2.5 border-b border-hairline p-3">
        <div class="font-mono text-[9px] uppercase tracking-wide text-[var(--color-text-dim)]">Основное</div>
        <div class="grid grid-cols-2 gap-2.5">
          <FormField
            label="Группа"
            :model-value="store.selectedControl.group"
            @update:model-value="updateField('group', $event)"
          />
          <FormField
            label="Название"
            :model-value="store.selectedControl.name"
            @update:model-value="updateField('name', $event)"
          />
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          <FormSelect
            label="Тип"
            :model-value="store.selectedControl.type"
            @update:model-value="updateField('type', $event)"
          >
            <option v-for="t in controlTypes" :key="t" :value="t">{{ t }}</option>
          </FormSelect>
          <FormSelect
            label="Разрешение"
            :model-value="store.selectedControl.builder_kind ?? ''"
            @update:model-value="updateField('builder_kind', $event)"
          >
            <option value="">—</option>
            <option v-for="bk in builderKinds" :key="bk" :value="bk">{{ bk }}</option>
          </FormSelect>
        </div>
        <FormField
          label="Подсказка (help)"
          :model-value="store.selectedControl.help ?? ''"
          @update:model-value="updateField('help', $event)"
        />
      </section>

      <section v-if="store.selectedControl.type === 'file'" class="flex flex-col gap-2.5 border-b border-hairline p-3">
        <div class="font-mono text-[9px] uppercase tracking-wide text-[var(--color-text-dim)]">Файл</div>
        <div class="grid grid-cols-2 gap-2.5">
          <FormField
            label="Типы файлов"
            :model-value="store.selectedControl.file_types ?? ''"
            @update:model-value="updateField('file_types', $event)"
          />
          <FormField
            label="Макс. размер"
            :model-value="store.selectedControl.max_size ?? ''"
            @update:model-value="updateField('max_size', $event)"
          />
        </div>
      </section>

      <section class="flex flex-col gap-2.5 border-b border-hairline p-3">
        <div class="font-mono text-[9px] uppercase tracking-wide text-[var(--color-text-dim)]">Валидация</div>
        <div class="flex gap-1.5">
          <button
            type="button"
            class="rounded-sm border px-2 py-1 text-[11px] transition-colors"
            :class="store.selectedControl.validate?.required === 'true'
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-hairline text-[var(--color-text-muted)]'"
            @click="updateValidate('required', store.selectedControl.validate?.required !== 'true')"
          >
            required
          </button>
          <button
            type="button"
            class="rounded-sm border px-2 py-1 text-[11px] transition-colors"
            :class="store.selectedControl.validate?.digits === 'true'
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-hairline text-[var(--color-text-muted)]'"
            @click="updateValidate('digits', store.selectedControl.validate?.digits !== 'true')"
          >
            digits
          </button>
        </div>

        <details class="group">
          <summary class="cursor-pointer select-none font-mono text-[10px] uppercase tracking-wide text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]">
            Дополнительно (validate JSON)
          </summary>
          <textarea
            v-model="validateJson"
            class="mt-1.5 w-full rounded-sm border border-hairline bg-input p-1.5 font-mono text-[11px] text-[var(--color-text)] outline-none focus:border-accent"
            rows="3"
          />
        </details>
      </section>

      <section class="border-b border-hairline p-3">
        <div class="mb-2 font-mono text-[9px] uppercase tracking-wide text-[var(--color-text-dim)]">Предпросмотр</div>
        <ControlPreview :control="store.selectedControl" />
      </section>

      <section class="flex flex-col gap-1 p-3 text-[11px]">
        <div class="mb-1 font-mono text-[9px] uppercase tracking-wide text-[var(--color-text-dim)]">Информация о параметре</div>
        <div class="flex justify-between gap-2">
          <span class="text-[var(--color-text-dim)]">Раздел</span>
          <span class="font-mono text-[var(--color-text-muted)]">{{ sectionLabel }}</span>
        </div>
        <div class="flex justify-between gap-2">
          <span class="text-[var(--color-text-dim)]">Источник</span>
          <span class="truncate font-mono text-[var(--color-text-muted)]">{{ store.selectedControl.sourceFieldKey ?? '—' }}</span>
        </div>
        <div class="flex justify-between gap-2">
          <span class="text-[var(--color-text-dim)]">Порядок</span>
          <span class="font-mono text-[var(--color-text-muted)]">{{ store.selectedControl.order }}</span>
        </div>
      </section>
    </div>
  </BasePanel>
</template>
