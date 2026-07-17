import type { WidgetStudioSnapshot } from '../model/history.types'
import { useWidgetBlockStore } from '@/stores/widgetBlockStore'
import { useSelectionStore } from '@/stores/selectionStore'
import { toRaw } from 'vue'

export function captureWidgetSnapshot(): WidgetStudioSnapshot {
  const blockStore = useWidgetBlockStore()
  const selection = useSelectionStore()

  return {
    rawInput: blockStore.rawInput,
    controlsJson: JSON.stringify(toRaw(blockStore.controls)),
    selectedSectionId: blockStore.selectedSectionId,
    selectedFieldKey: blockStore.selectedFieldKey,
    selectedControlKey: blockStore.selectedControlKey,
    selectedFieldKeys: [...selection.selectedFieldKeys],
    selectedControlKeys: [...selection.selectedControlKeys],
  }
}

export function restoreWidgetSnapshot(snapshot: WidgetStudioSnapshot): void {
  const blockStore = useWidgetBlockStore()
  const selection = useSelectionStore()

  blockStore.restoreWorkspaceSnapshot(snapshot)
  selection.selectedFieldKeys = new Set(snapshot.selectedFieldKeys)
  selection.selectedControlKeys = new Set(snapshot.selectedControlKeys)
}

export function snapshotsEqual(a: WidgetStudioSnapshot, b: WidgetStudioSnapshot): boolean {
  return a.rawInput === b.rawInput && a.controlsJson === b.controlsJson
}
