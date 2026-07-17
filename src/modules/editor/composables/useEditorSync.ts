import { ref, watch } from 'vue'
import { debounce } from '@/utils/debounce'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import { useEditorStore } from '@/stores/editorStore'
import { parseControlsRaw } from '@/modules/widget-block/parser'
import { exportWidgetBlock } from '@/modules/widget-block/serializer'

export type SyncSource = 'raw' | 'object' | 'controls' | 'external' | null

export function useEditorSync() {
  const blockStore = useWidgetBlockStore()
  const editorStore = useEditorStore()
  const syncSource = ref<SyncSource>(null)

  function withSyncGuard(source: SyncSource, fn: () => void) {
    if (syncSource.value && syncSource.value !== source) return
    syncSource.value = source
    try {
      fn()
    } finally {
      queueMicrotask(() => {
        syncSource.value = null
      })
    }
  }

  const applyRawChange = debounce((value: string) => {
    withSyncGuard('raw', () => {
      editorStore.runWithHistory('raw-edit', () => {
        blockStore.updateRawInput(value)
      })
    })
  }, 400)

  const applyObjectChange = debounce((jsonText: string) => {
    withSyncGuard('object', () => {
      editorStore.runWithHistory('object-edit', () => {
        if (blockStore.applyObjectView(jsonText)) {
          blockStore.rawInput = exportWidgetBlock(
            blockStore.parsedBlock!,
            blockStore.controls,
          )
        }
      })
    })
  }, 500)

  const applyControlsChange = debounce((yamlText: string) => {
    withSyncGuard('controls', () => {
      try {
        const parsed = parseControlsRaw(yamlText)
        if (Object.keys(parsed).length === 0 && yamlText.trim()) return
        editorStore.runWithHistory('controls-edit', () => {
          blockStore.setControls(parsed)
        })
      } catch {
        return
      }
    })
  }, 500)

  watch(
    () => blockStore.isDirty,
    (dirty) => {
      if (dirty) editorStore.markUnsaved()
    },
  )

  return {
    syncSource,
    applyRawChange,
    applyObjectChange,
    applyControlsChange,
    withSyncGuard,
  }
}
