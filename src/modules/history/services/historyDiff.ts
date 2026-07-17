import type { HistoryDiffSummary, WidgetStudioSnapshot } from '../model/history.types'

export function diffSnapshots(
  before: WidgetStudioSnapshot,
  after: WidgetStudioSnapshot,
): HistoryDiffSummary {
  const rawChanged = before.rawInput !== after.rawInput
  const controlsChanged = before.controlsJson !== after.controlsJson

  let controlCountDelta = 0
  if (controlsChanged) {
    try {
      const beforeCount = Object.keys(JSON.parse(before.controlsJson) as object).length
      const afterCount = Object.keys(JSON.parse(after.controlsJson) as object).length
      controlCountDelta = afterCount - beforeCount
    } catch {
      controlCountDelta = 0
    }
  }

  const selectionChanged =
    before.selectedFieldKey !== after.selectedFieldKey ||
    before.selectedControlKey !== after.selectedControlKey ||
    before.selectedSectionId !== after.selectedSectionId

  const parts: string[] = []
  if (rawChanged) parts.push('block')
  if (controlsChanged) {
    parts.push(controlCountDelta !== 0 ? `controls (${controlCountDelta > 0 ? '+' : ''}${controlCountDelta})` : 'controls')
  }
  if (selectionChanged) parts.push('selection')

  return {
    rawChanged,
    controlsChanged,
    selectionChanged,
    controlCountDelta,
    summary: parts.length > 0 ? parts.join(', ') : 'no changes',
  }
}
