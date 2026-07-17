import type { BlockField, WidgetBlock } from '../types'
import type { BuilderKind } from '@/modules/controls/types'
import {
  analyzeField,
  detectBreakpoint,
  getFieldDisplayName,
  resolveFieldGroup,
} from '../analyzer'

export function inferBreakpoint(key: string): BuilderKind {
  const bp = detectBreakpoint(key)
  if (bp === 'tablet') return 'design-tablet'
  if (bp === 'phone') return 'design-phone'
  return 'design-desktop'
}

export function collectAllFields(block: WidgetBlock): BlockField[] {
  const fields: BlockField[] = [
    ...block.required,
    ...block.content,
    ...block.styleGroups.flatMap((g) => g.fields),
  ]
  return fields.sort((a, b) => a.order - b.order)
}

export function findFieldByKey(block: WidgetBlock, key: string): BlockField | undefined {
  return collectAllFields(block).find((f) => f.key === key)
}

export function getExpectedGroup(field: BlockField): string {
  return resolveFieldGroup(field)
}

export { analyzeField, getFieldDisplayName }
