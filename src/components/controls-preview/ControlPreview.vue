<script setup lang="ts">
import { computed } from 'vue'
import type { ControlSchema } from '@/modules/controls/types'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'

const props = defineProps<{
  control: ControlSchema
}>()

const store = useWidgetBlockStore()

const fieldValue = computed(() => {
  const field = store.selectedField
  if (!field) return ''
  return String(field.value ?? '')
})
</script>

<template>
  <div class="rounded-sm border border-hairline bg-input p-2.5">
    <div class="mb-1.5 text-[11px] font-semibold text-[var(--color-text-muted)]">{{ control.name }}</div>

    <input
      v-if="control.type === 'textfield' || control.type === 'range'"
      class="w-full rounded-sm border border-hairline bg-panel px-2 py-1.5 text-[12px] text-[var(--color-text)]"
      type="text"
      :value="fieldValue"
      readonly
      :placeholder="control.help"
    />

    <textarea
      v-else-if="control.type === 'textarea' || control.type === 'wysiwyg'"
      class="w-full rounded-sm border border-hairline bg-panel px-2 py-1.5 text-[12px] text-[var(--color-text)]"
      :value="fieldValue"
      readonly
      rows="3"
    />

    <div v-else-if="control.type === 'color'" class="flex items-center gap-2">
      <span class="h-6 w-6 rounded border border-hairline" :style="{ background: fieldValue || '#ccc' }" />
      <span class="text-[12px]">{{ fieldValue }}</span>
    </div>

    <select v-else-if="control.type === 'select'" class="w-full rounded-sm border border-hairline bg-panel px-2 py-1.5 text-[12px] text-[var(--color-text)]" disabled>
      <option v-for="(label, val) in control.options" :key="val" :value="val">
        {{ label }}
      </option>
    </select>

    <div v-else-if="control.type === 'radio'" class="flex flex-col gap-1">
      <label v-for="(label, val) in control.options" :key="val" class="flex items-center gap-1.5 text-[12px]">
        <input type="radio" disabled :checked="fieldValue === val" />
        {{ label }}
      </label>
    </div>

    <label v-else-if="control.type === 'checkbox'" class="flex items-center gap-2 text-[12px]">
      <input type="checkbox" disabled :checked="fieldValue === 'true'" />
      {{ control.name }}
    </label>

    <label v-else-if="control.type === 'switch'" class="flex items-center gap-2 text-[12px]">
      <input type="checkbox" disabled :checked="fieldValue === 'true'" />
      {{ control.name }}
    </label>

    <div v-else-if="control.type === 'file'" class="flex flex-col gap-1 rounded-sm border border-dashed border-hairline-strong p-2 text-[12px]">
      <span class="text-base leading-none">📎</span>
      <span>{{ fieldValue || 'Файл не выбран' }}</span>
      <small v-if="control.file_types" class="text-[var(--color-text-dim)]">{{ control.file_types }} · max {{ control.max_size }}MB</small>
    </div>

    <div v-else-if="control.type === 'collection'" class="flex items-center gap-2 rounded-sm border border-dashed border-accent p-3">
      <span class="rounded bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">Коллекция</span>
      <span class="text-[12px]">{{ control.name }}</span>
    </div>

    <input v-else class="w-full rounded-sm border border-hairline bg-panel px-2 py-1.5 text-[12px] text-[var(--color-text)]" type="text" :value="fieldValue" readonly />

    <p v-if="control.help" class="mt-1.5 text-[10px] text-[var(--color-text-dim)]">{{ control.help }}</p>
    <p v-if="control.validate" class="mt-1.5 text-[10px] text-[var(--color-text-dim)]">
      validate: {{ JSON.stringify(control.validate) }}
    </p>
  </div>
</template>
