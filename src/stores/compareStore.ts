import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { WidgetBlock } from '@/modules/widget-block/types'
import type { ControlsMap } from '@/modules/controls/types'
import { parseWidgetBlock } from '@/modules/widget-block/parser'
import { compareBlocks, mergeControlsFromSource } from '@/modules/block-compare'
import type { BlockCompareResult } from '@/modules/block-compare'

export const useCompareStore = defineStore('compare', () => {
  const isActive = ref(false)
  const comparedRaw = ref('')
  const comparedBlock = ref<WidgetBlock | null>(null)
  const comparedControls = ref<ControlsMap>({})
  const selectedCompareKeys = ref<Set<string>>(new Set())

  function importComparedBlock(raw: string) {
    comparedRaw.value = raw
    const result = parseWidgetBlock(raw)
    comparedBlock.value = result.block
    comparedControls.value = result.block?.controlsParsed ?? {}
    isActive.value = true
  }

  function openCompareMode() {
    isActive.value = true
  }

  function closeCompareMode() {
    isActive.value = false
    comparedRaw.value = ''
    comparedBlock.value = null
    comparedControls.value = {}
    selectedCompareKeys.value = new Set()
  }

  function toggleCompareKey(key: string) {
    const next = new Set(selectedCompareKeys.value)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    selectedCompareKeys.value = next
  }

  function computeCompare(
    leftBlock: WidgetBlock,
    rightBlock: WidgetBlock,
    leftControls: ControlsMap,
    rightControls: ControlsMap,
  ): BlockCompareResult {
    return compareBlocks(leftBlock, rightBlock, leftControls, rightControls)
  }

  function mergeSelectedControlsToTarget(
    target: ControlsMap,
    source: ControlsMap,
    keys: string[],
    missingOnly = false,
  ): ControlsMap {
    return mergeControlsFromSource(target, source, keys, missingOnly)
  }

  return {
    isActive,
    comparedRaw,
    comparedBlock,
    comparedControls,
    selectedCompareKeys,
    importComparedBlock,
    openCompareMode,
    closeCompareMode,
    toggleCompareKey,
    computeCompare,
    mergeSelectedControlsToTarget,
  }
})
