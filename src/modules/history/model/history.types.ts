export interface WidgetStudioSnapshot {
  rawInput: string
  controlsJson: string
  selectedSectionId: string | null
  selectedFieldKey: string | null
  selectedControlKey: string | null
  selectedFieldKeys: string[]
  selectedControlKeys: string[]
}

export interface HistoryEntry {
  id: string
  title: string
  timestamp: number
  before: WidgetStudioSnapshot
  after: WidgetStudioSnapshot
  meta?: Record<string, unknown>
}

export interface HistoryDiffSummary {
  rawChanged: boolean
  controlsChanged: boolean
  selectionChanged: boolean
  controlCountDelta: number
  summary: string
}
