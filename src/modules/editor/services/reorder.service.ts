import { toRaw } from 'vue'
import type { BlockField, WidgetBlock } from '@/modules/widget-block/types'
import type { ControlsMap } from '@/modules/controls/types'

export function reorderSectionFields(
  block: WidgetBlock,
  sectionId: string,
  fromIndex: number,
  toIndex: number,
): WidgetBlock {
  if (fromIndex === toIndex) return block

  const clone = structuredClone(toRaw(block))

  let fields: BlockField[] = []
  if (sectionId === 'required') fields = clone.required
  else if (sectionId === 'content') fields = clone.content
  else if (sectionId.startsWith('style-')) {
    const title = sectionId.replace('style-', '')
    const group = clone.styleGroups.find((g) => g.title === title)
    if (!group) return block
    fields = group.fields
  } else {
    return block
  }

  const [moved] = fields.splice(fromIndex, 1)
  if (!moved) return block
  fields.splice(toIndex, 0, moved)

  fields.forEach((f, i) => {
    f.order = i
  })

  return clone
}

export function reorderControls(controls: ControlsMap, orderedKeys: string[]): ControlsMap {
  const result: ControlsMap = {}
  let order = 0

  for (const key of orderedKeys) {
    const control = controls[key]
    if (control) {
      result[key] = { ...control, order: order++ }
    }
  }

  for (const [key, control] of Object.entries(controls)) {
    if (!result[key]) {
      result[key] = { ...control, order: order++ }
    }
  }

  return result
}

export function getControlKeysInOrder(controls: ControlsMap): string[] {
  return Object.values(controls)
    .sort((a, b) => a.order - b.order)
    .map((c) => c.key)
}

export function moveControlKey(keys: string[], from: number, to: number): string[] {
  const next = [...keys]
  const [item] = next.splice(from, 1)
  if (!item) return keys
  next.splice(to, 0, item)
  return next
}
