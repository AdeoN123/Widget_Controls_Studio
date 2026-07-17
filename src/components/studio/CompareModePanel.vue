<script setup lang="ts">
import { computed, ref } from 'vue'
import BasePanel from '@/components/UI/BasePanel.vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import CodeEditor from '@/components/editors/CodeEditor.vue'
import { useCompareStore } from '@/stores/compareStore'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import { useWidgetStudioStore } from '@/stores/widgetStudioStore'

const compareStore = useCompareStore()
const blockStore = useWidgetBlockStore()
const studio = useWidgetStudioStore()
const importRaw = ref('')

const result = computed(() => {
  if (!compareStore.comparedBlock || !blockStore.parsedBlock) return null
  return compareStore.computeCompare(
    blockStore.parsedBlock,
    compareStore.comparedBlock,
    blockStore.controls,
    compareStore.comparedControls,
  )
})

function loadCompared() {
  compareStore.importComparedBlock(importRaw.value)
}

function copySelected() {
  studio.mergeFromComparedBlock(false)
}

function copyMissing() {
  studio.mergeFromComparedBlock(true)
}
</script>

<template>
  <BasePanel title="Сравнение блоков" no-padding>
    <div class="border-b border-hairline p-2">
      <CodeEditor v-model="importRaw" language="plaintext" height="120px" />
      <BaseButton size="sm" @click="loadCompared">Импортировать блок для сравнения</BaseButton>
    </div>

    <div v-if="result" class="flex gap-3 px-3 py-2 text-[10px] text-[var(--color-text-muted)]">
      <span>Полей только справа: {{ result.fields.filter((f) => f.status === 'only_right').length }}</span>
      <span>Контролов не хватает: {{ result.controls.filter((c) => c.status === 'only_right').length }}</span>
      <span>Отличается контролов: {{ result.controls.filter((c) => c.status === 'different').length }}</span>
    </div>

    <ul v-if="result" class="max-h-[160px] list-none overflow-y-auto">
      <li
        v-for="item in result.controls.filter((c) => c.status !== 'same')"
        :key="item.key"
        class="flex cursor-pointer items-center gap-2 border-b border-hairline px-3 py-1.5 text-[11px]"
        @click="compareStore.toggleCompareKey(item.key)"
      >
        <input
          type="checkbox"
          :checked="compareStore.selectedCompareKeys.has(item.key)"
          @click.stop
          @change="compareStore.toggleCompareKey(item.key)"
        />
        <span class="flex-1 font-mono">{{ item.key }}</span>
        <span class="text-signal">{{ item.status }}</span>
      </li>
    </ul>

    <div class="flex gap-2 px-3 py-2">
      <BaseButton size="sm" @click="copyMissing">Скопировать недостающие</BaseButton>
      <BaseButton size="sm" @click="copySelected">Скопировать выбранные</BaseButton>
      <BaseButton size="sm" variant="ghost" @click="compareStore.closeCompareMode()">Закрыть</BaseButton>
    </div>
  </BasePanel>
</template>
