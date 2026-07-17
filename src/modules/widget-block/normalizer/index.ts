import type { WidgetBlock } from '../types'
import { analyzeField } from '../analyzer'

const BREAKPOINT_ORDER = { desktop: 0, tablet: 1, phone: 2 }

function sortStyleFields(fields: WidgetBlock['styleGroups'][0]['fields']) {
  return [...fields].sort((a, b) => {
    const metaA = analyzeField(a)
    const metaB = analyzeField(b)
    const bpA = BREAKPOINT_ORDER[metaA.breakpoint]
    const bpB = BREAKPOINT_ORDER[metaB.breakpoint]
    if (bpA !== bpB) return bpA - bpB
    return a.order - b.order
  })
}

export function normalizeWidgetBlock(block: WidgetBlock): WidgetBlock {
  const required = block.required.map((f, i) => ({ ...f, order: i }))

  let fieldOrder = required.length

  const content = block.content.map((f, i) => ({
    ...f,
    order: fieldOrder + i,
  }))
  fieldOrder += content.length

  const styleGroups = block.styleGroups
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((group, groupIndex) => {
      const sortedFields = sortStyleFields(group.fields).map((f, i) => ({
        ...f,
        order: fieldOrder + i,
      }))
      fieldOrder += sortedFields.length
      return {
        ...group,
        order: groupIndex,
        fields: sortedFields,
      }
    })

  const sections = block.sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((s, i) => ({ ...s, order: i }))

  return {
    ...block,
    sections,
    required,
    content,
    styleGroups,
  }
}

export function normalizeControlsOrder(
  block: WidgetBlock,
  controls: import('@/modules/controls/types').ControlsMap,
): import('@/modules/controls/types').ControlsMap {
  const orderedKeys = [
    ...block.content.map((f) => f.key),
    ...block.styleGroups
      .slice()
      .sort((a, b) => a.order - b.order)
      .flatMap((g) => g.fields.map((f) => f.key)),
  ]

  const result: import('@/modules/controls/types').ControlsMap = {}
  let order = 0

  for (const key of orderedKeys) {
    const control = controls[key]
    if (control) {
      result[key] = { ...control, order: order++ }
    }
  }

  return result
}
