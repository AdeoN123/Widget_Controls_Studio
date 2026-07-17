import type { WidgetBlock } from '@/modules/widget-block/types'
import type { ControlsMap } from '@/modules/controls/types'

export interface RenameFieldResult {
  block: WidgetBlock
  controls: ControlsMap
  renamedFrom: string
  renamedTo: string
}

export function renameField(
  block: WidgetBlock,
  controls: ControlsMap,
  fromKey: string,
  toKey: string,
): RenameFieldResult | null {
  if (fromKey === toKey) return null

  const renameInList = (fields: typeof block.required) => {
    const field = fields.find((f) => f.key === fromKey)
    if (field) field.key = toKey
  }

  renameInList(block.required)
  renameInList(block.content)
  for (const group of block.styleGroups) {
    renameInList(group.fields)
  }

  const nextControls = { ...controls }
  if (nextControls[fromKey]) {
    nextControls[toKey] = { ...nextControls[fromKey], key: toKey }
    delete nextControls[fromKey]
  }

  return { block: { ...block }, controls: nextControls, renamedFrom: fromKey, renamedTo: toKey }
}
