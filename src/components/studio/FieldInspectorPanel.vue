<script setup lang="ts">
import { computed, ref } from 'vue'
import BasePanel from '@/components/UI/BasePanel.vue'
import FormField from '@/components/UI/FormField.vue'
import FormSelect from '@/components/UI/FormSelect.vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import { useWidgetStudioStore } from '@/stores/widgetStudioStore'

const store = useWidgetBlockStore()
const studio = useWidgetStudioStore()

const renameTo = ref('')

function applyRename() {
  if (!store.selectedField || !renameTo.value.trim()) return
  studio.safeRenameField(store.selectedField.key, renameTo.value.trim())
  renameTo.value = ''
}

const fieldValue = computed({
  get: () => store.selectedField?.rawValue ?? '',
  set: (v: string) => {
    if (!store.selectedField) return
    store.updateFieldValue(store.selectedField.key, v, v.replace(/^"|"$/g, ''))
  },
})

const sectionLabel = computed(() => {
  const f = store.selectedField
  if (!f) return ''
  if (f.sectionKind === 'required') return 'Обязательное'
  if (f.sectionKind === 'content') return 'Контент'
  return f.groupTitle ?? ''
})
</script>

<template>
  <BasePanel no-padding class="inspector">
    <template #header>
      <div v-if="store.selectedField" class="flex min-w-0 flex-1 items-center gap-2">
        <span class="shrink-0 rounded-sm border border-hairline-strong px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-[var(--color-text-muted)]">
          {{ sectionLabel }}
        </span>
        <span class="truncate font-mono text-[11px] text-[var(--color-text-muted)]">{{ store.selectedField.key }}</span>
      </div>
      <h3 v-else class="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        Свойства параметра
      </h3>
    </template>

    <div v-if="!store.selectedField" class="p-4 text-center text-[12px] text-[var(--color-text-dim)]">
      Выберите параметр
    </div>

    <div v-else class="flex flex-col gap-2.5 p-3">
      <FormField v-model="fieldValue" label="Значение (value)" />

      <div class="grid grid-cols-2 gap-2.5">
        <FormField label="Группа" :model-value="store.selectedField.groupTitle ?? sectionLabel" readonly />
        <FormSelect label="Разрешение" :model-value="store.fieldBreakpoint" disabled>
          <option value="design-desktop">design-desktop</option>
          <option value="design-tablet">design-tablet</option>
          <option value="design-phone">design-phone</option>
        </FormSelect>
      </div>
      <FormField label="Порядок" :model-value="String(store.selectedField.order)" readonly />

      <div class="flex flex-col gap-1.5 border-t border-hairline pt-2.5">
        <FormField v-model="renameTo" label="Переименовать ключ" placeholder="новый_ключ" />
        <BaseButton size="sm" :disabled="!renameTo.trim()" @click="applyRename">Переименовать</BaseButton>
      </div>
    </div>
  </BasePanel>
</template>
