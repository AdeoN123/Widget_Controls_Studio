import type { WidgetBlock } from '@/modules/widget-block/types'
import type { ControlsMap } from '@/modules/controls/types'
import { renameField } from '@/modules/refactor/services/renameField.service'
import { normalizeFieldKey } from '@/modules/refactor/services/createBreakpointFields.service'
import { generateControls } from '@/modules/controls/generator'

type BulkRenameResult = { block: WidgetBlock; controls: ControlsMap; renamed: string[] }

function bulkRenameKeys(
  block: WidgetBlock,
  controls: ControlsMap,
  keys: string[],
  computeNewKey: (key: string) => string | null,
): BulkRenameResult {
  let nextBlock = block
  let nextControls = controls
  const renamed: string[] = []

  for (const key of keys) {
    const newKey = computeNewKey(key)
    if (newKey === null || newKey === key) continue
    const result = renameField(nextBlock, nextControls, key, newKey)
    if (result) {
      nextBlock = result.block
      nextControls = result.controls
      renamed.push(`${key} → ${newKey}`)
    }
  }

  return { block: nextBlock, controls: nextControls, renamed }
}

export function bulkRenameFieldsByPattern(
  block: WidgetBlock,
  controls: ControlsMap,
  pattern: RegExp,
  replacement: string,
): BulkRenameResult {
  const allKeys = [
    ...block.content.map((f) => f.key),
    ...block.styleGroups.flatMap((g) => g.fields.map((f) => f.key)),
  ]
  return bulkRenameKeys(block, controls, allKeys, (key) =>
    pattern.test(key) ? key.replace(pattern, replacement) : null,
  )
}

export function bulkNormalizeFieldNames(
  block: WidgetBlock,
  controls: ControlsMap,
  keys: string[],
): BulkRenameResult {
  return bulkRenameKeys(block, controls, keys, (key) => normalizeFieldKey(key))
}

export function bulkGenerateControlsForFields(
  block: WidgetBlock,
  controls: ControlsMap,
  fieldKeys: string[],
): ControlsMap {
  const generated = generateControls(block)
  const next = { ...controls }
  for (const key of fieldKeys) {
    if (generated[key]) next[key] = generated[key]
  }
  return next
}
