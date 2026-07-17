export type EditorLanguage = 'yaml' | 'javascript' | 'json' | 'plaintext'

export type EditorDiagnosticSeverity = 'error' | 'warning' | 'info'

export interface EditorDiagnostic {
  line: number
  column: number
  endLine?: number
  endColumn?: number
  message: string
  severity: EditorDiagnosticSeverity
  code?: string
}

export type DiffMode =
  | 'original-current'
  | 'before-normalize'
  | 'before-repair'
  | 'before-generate'

export interface LayoutSizes {
  sidebarWidth: number
  inspectorWidth: number
  codePanelHeight: number
  centerTableFlex: number
}

export const DEFAULT_LAYOUT: LayoutSizes = {
  sidebarWidth: 240,
  inspectorWidth: 320,
  codePanelHeight: 280,
  centerTableFlex: 1,
}

export interface EditorSnapshot {
  rawInput: string
  controlsJson: string
  label?: string
  timestamp: number
}
