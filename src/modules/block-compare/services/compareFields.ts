import type { WidgetBlock } from '@/modules/widget-block/types'
import type { FieldCompareItem } from '../model/compare.types'
import { unionKeys } from './compareUtils'

function allEditableFields(block: WidgetBlock) {
  return [...block.content, ...block.styleGroups.flatMap((g) => g.fields)]
}

export function compareFields(left: WidgetBlock, right: WidgetBlock): FieldCompareItem[] {
  const leftMap = new Map(allEditableFields(left).map((f) => [f.key, f]))
  const rightMap = new Map(allEditableFields(right).map((f) => [f.key, f]))
  const keys = unionKeys(leftMap, rightMap)
  const result: FieldCompareItem[] = []

  for (const key of keys) {
    const lf = leftMap.get(key)
    const rf = rightMap.get(key)
    if (lf && !rf) result.push({ key, status: 'only_left', leftValue: lf.value })
    else if (!lf && rf) result.push({ key, status: 'only_right', rightValue: rf.value })
    else if (lf && rf) {
      const same = JSON.stringify(lf.value) === JSON.stringify(rf.value)
      result.push({
        key,
        status: same ? 'same' : 'different',
        leftValue: lf.value,
        rightValue: rf.value,
      })
    }
  }

  return result.sort((a, b) => a.key.localeCompare(b.key))
}
