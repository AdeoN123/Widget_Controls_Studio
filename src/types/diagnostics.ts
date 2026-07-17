export type DiagnosticSeverity = 'error' | 'warning' | 'info'

export type DiagnosticCategory = 'parse' | 'controls' | 'validation' | 'normalize' | 'export'

export interface DiagnosticItem {
  id: string
  severity: DiagnosticSeverity
  category: DiagnosticCategory
  code: string
  message: string
  fieldKey?: string
  sectionTitle?: string
}

export function createDiagnostic(
  partial: Omit<DiagnosticItem, 'id'> & { id?: string },
): DiagnosticItem {
  return {
    id: partial.id ?? `${partial.code}-${partial.fieldKey ?? partial.sectionTitle ?? crypto.randomUUID()}`,
    ...partial,
  }
}
