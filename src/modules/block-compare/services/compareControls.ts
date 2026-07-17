import type { ControlsMap } from '@/modules/controls/types'
import type { ControlCompareItem } from '../model/compare.types'
import { unionKeys } from './compareUtils'

function controlDiff(left: ControlsMap[string], right: ControlsMap[string]): string[] {
  const diffs: string[] = []
  if (left.type !== right.type) diffs.push('type')
  if (left.group !== right.group) diffs.push('group')
  if (JSON.stringify(left.validate) !== JSON.stringify(right.validate)) diffs.push('validate')
  if (left.file_types !== right.file_types) diffs.push('file_types')
  if (left.max_size !== right.max_size) diffs.push('max_size')
  if (JSON.stringify(left.options) !== JSON.stringify(right.options)) diffs.push('options')
  return diffs
}

export function compareControls(left: ControlsMap, right: ControlsMap): ControlCompareItem[] {
  const keys = unionKeys(left, right)
  const result: ControlCompareItem[] = []

  for (const key of keys) {
    const lc = left[key]
    const rc = right[key]
    if (lc && !rc) result.push({ key, status: 'only_left', differences: [] })
    else if (!lc && rc) result.push({ key, status: 'only_right', differences: [] })
    else if (lc && rc) {
      const differences = controlDiff(lc, rc)
      result.push({
        key,
        status: differences.length === 0 ? 'same' : 'different',
        differences,
      })
    }
  }

  return result.sort((a, b) => a.key.localeCompare(b.key))
}
