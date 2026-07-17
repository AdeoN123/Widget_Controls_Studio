<script setup lang="ts">
import { computed, ref } from 'vue'
import BasePanel from '@/components/UI/BasePanel.vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import ControlPreview from '@/components/controls-preview/ControlPreview.vue'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import { useSelectionStore } from '@/stores/selectionStore'
import { inferBreakpoint } from '@/modules/widget-block/utils/fieldUtils'

const store = useWidgetBlockStore()
const selection = useSelectionStore()
const dragIndex = ref<number | null>(null)

const sectionTitle = computed(() => {
  const id = store.selectedSectionId
  if (!id) return ''
  if (id === 'required') return 'Обязательное'
  if (id === 'content') return 'Контент'
  if (id === 'controls') return 'Контролы'
  return id.replace('style-', '')
})

const isControlsSection = computed(() => store.selectedSectionId === 'controls')

function inferFieldType(key: string): string {
  const control = store.controls[key]
  if (control) return control.type
  if (key.includes('color')) return 'color'
  if (key.includes('image') || key.includes('arrow')) return 'file'
  if (key.includes('font_size') || key.includes('padding')) return 'number'
  return 'text'
}

function breakpointLabel(key: string): string {
  const bp = inferBreakpoint(key)
  if (bp === 'design-tablet') return 'tablet'
  if (bp === 'design-phone') return 'phone'
  return 'desktop'
}

function onRowClick(key: string, event: MouseEvent) {
  if (selection.multiSelectMode || event.shiftKey) {
    if (isControlsSection.value) selection.toggleControl(key)
    else selection.toggleField(key)
    return
  }
  if (isControlsSection.value) store.selectControl(key)
  else store.selectField(key)
}

function onDragStart(event: DragEvent, index: number) {
  dragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onDrop(event: DragEvent, toIndex: number) {
  event.preventDefault()
  if (dragIndex.value === null || dragIndex.value === toIndex) {
    dragIndex.value = null
    return
  }
  if (isControlsSection.value) {
    store.reorderControlKeys(dragIndex.value, toIndex)
  } else {
    store.reorderField(dragIndex.value, toIndex)
  }
  dragIndex.value = null
}

function onDragEnd() {
  dragIndex.value = null
}

function selectedKeys(): string[] {
  if (isControlsSection.value) return [...selection.selectedControlKeys]
  return [...selection.selectedFieldKeys]
}

function bulkValidate() {
  store.bulkAddValidate(selectedKeys())
}

function bulkRepair() {
  store.regenerateSelectedControls(selectedKeys())
}
</script>

<template>
  <BasePanel no-padding class="h-full">
    <template #header>
      <div class="flex w-full items-center justify-between gap-2">
        <h3 class="font-mono text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Параметры группы: #{{ sectionTitle }}
        </h3>
        <div class="flex gap-1">
          <BaseButton size="sm" variant="ghost" @click="selection.multiSelectMode = !selection.multiSelectMode">
            {{ selection.multiSelectMode ? 'Мульти ✓' : 'Мульти' }}
          </BaseButton>
          <BaseButton
            v-if="!isControlsSection"
            size="sm"
            variant="ghost"
            @click="store.resetFieldOrder()"
          >
            Сбросить порядок
          </BaseButton>
          <BaseButton v-else size="sm" variant="ghost" @click="store.resetControlOrder()">
            Сбросить порядок
          </BaseButton>
        </div>
      </div>
    </template>

    <div v-if="selectedKeys().length > 0" class="flex items-center gap-2 bg-accent/15 px-3 py-1.5 text-[11px]">
      <span>{{ selectedKeys().length }} выбрано</span>
      <BaseButton size="sm" @click="bulkValidate">+ validate</BaseButton>
      <BaseButton size="sm" @click="bulkRepair">Восстановить шаблон</BaseButton>
      <BaseButton size="sm" @click="selection.clearAll()">Очистить</BaseButton>
    </div>

    <table v-if="isControlsSection" class="w-full border-collapse text-[12px]">
      <thead>
        <tr>
          <th class="sticky top-0 border-b border-hairline bg-panel-elevated px-2.5 py-1.5" />
          <th class="sticky top-0 border-b border-hairline bg-panel-elevated px-2.5 py-1.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">#</th>
          <th class="sticky top-0 border-b border-hairline bg-panel-elevated px-2.5 py-1.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">Контрол</th>
          <th class="sticky top-0 border-b border-hairline bg-panel-elevated px-2.5 py-1.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">Группа</th>
          <th class="sticky top-0 border-b border-hairline bg-panel-elevated px-2.5 py-1.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">Тип</th>
          <th class="sticky top-0 border-b border-hairline bg-panel-elevated px-2.5 py-1.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">Предпросмотр</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(control, index) in store.controlList"
          :key="control.key"
          class="cursor-pointer transition-colors hover:bg-panel-elevated"
          draggable="true"
          :class="[
            store.selectedControlKey === control.key && '!bg-accent/15',
            selection.selectedControlKeys.has(control.key) && 'outline outline-1 outline-accent',
          ]"
          @click="onRowClick(control.key, $event)"
          @dragstart="onDragStart($event, index)"
          @dragover="onDragOver"
          @drop="onDrop($event, index)"
          @dragend="onDragEnd"
        >
          <td class="w-6 cursor-grab border-b border-hairline px-2.5 py-1.5 text-[var(--color-text-dim)]">⠿</td>
          <td class="border-b border-hairline px-2.5 py-1.5">{{ index + 1 }}</td>
          <td class="border-b border-hairline px-2.5 py-1.5 font-mono">{{ control.key }}</td>
          <td class="border-b border-hairline px-2.5 py-1.5">{{ control.group }}</td>
          <td class="border-b border-hairline px-2.5 py-1.5">{{ control.type }}</td>
          <td class="max-w-[200px] border-b border-hairline px-2.5 py-1.5">
            <ControlPreview :control="control" />
          </td>
        </tr>
      </tbody>
    </table>

    <table v-else class="w-full border-collapse text-[12px]">
      <thead>
        <tr>
          <th class="sticky top-0 border-b border-hairline bg-panel-elevated px-2.5 py-1.5" />
          <th class="sticky top-0 border-b border-hairline bg-panel-elevated px-2.5 py-1.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">#</th>
          <th class="sticky top-0 border-b border-hairline bg-panel-elevated px-2.5 py-1.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">Параметр</th>
          <th class="sticky top-0 border-b border-hairline bg-panel-elevated px-2.5 py-1.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">Значение</th>
          <th class="sticky top-0 border-b border-hairline bg-panel-elevated px-2.5 py-1.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">Тип</th>
          <th class="sticky top-0 border-b border-hairline bg-panel-elevated px-2.5 py-1.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">Разрешение</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(field, index) in store.selectedSectionFields"
          :key="field.key"
          class="cursor-pointer transition-colors hover:bg-panel-elevated"
          draggable="true"
          :class="[
            store.selectedFieldKey === field.key && '!bg-accent/15',
            selection.selectedFieldKeys.has(field.key) && 'outline outline-1 outline-accent',
          ]"
          @click="onRowClick(field.key, $event)"
          @dragstart="onDragStart($event, index)"
          @dragover="onDragOver"
          @drop="onDrop($event, index)"
          @dragend="onDragEnd"
        >
          <td class="w-6 cursor-grab border-b border-hairline px-2.5 py-1.5 text-[var(--color-text-dim)]">⠿</td>
          <td class="border-b border-hairline px-2.5 py-1.5">{{ index + 1 }}</td>
          <td class="border-b border-hairline px-2.5 py-1.5 font-mono">{{ field.key }}</td>
          <td class="max-w-[180px] truncate border-b border-hairline px-2.5 py-1.5 font-mono text-[var(--color-text-muted)]">{{ field.rawValue }}</td>
          <td class="border-b border-hairline px-2.5 py-1.5">{{ inferFieldType(field.key) }}</td>
          <td class="border-b border-hairline px-2.5 py-1.5">{{ breakpointLabel(field.key) }}</td>
        </tr>
      </tbody>
    </table>
  </BasePanel>
</template>
