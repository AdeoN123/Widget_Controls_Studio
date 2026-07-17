import type { WidgetBlock } from '@/modules/widget-block/types'
import type { ControlsMap } from '@/modules/controls/types'
import type { BlockCompareResult } from '../model/compare.types'
import { compareFields } from './compareFields'
import { compareControls } from './compareControls'
import { unionKeys } from './compareUtils'

export function compareBlocks(
  leftBlock: WidgetBlock,
  rightBlock: WidgetBlock,
  leftControls: ControlsMap,
  rightControls: ControlsMap,
): BlockCompareResult {
  const leftSections = new Map(leftBlock.styleGroups.map((g) => [g.title, g.fields.length]))
  const rightSections = new Map(rightBlock.styleGroups.map((g) => [g.title, g.fields.length]))
  const sectionTitles = unionKeys(leftSections, rightSections)

  const sections = sectionTitles.map((title) => {
    const lc = leftSections.get(title) ?? 0
    const rc = rightSections.get(title) ?? 0
    let status: 'only_left' | 'only_right' | 'different' | 'same' = 'same'
    if (lc > 0 && rc === 0) status = 'only_left'
    else if (lc === 0 && rc > 0) status = 'only_right'
    else if (lc !== rc) status = 'different'
    return { title, status, leftCount: lc, rightCount: rc }
  })

  return {
    fields: compareFields(leftBlock, rightBlock),
    controls: compareControls(leftControls, rightControls),
    sections,
  }
}

export function mergeControlsFromSource(
  target: ControlsMap,
  source: ControlsMap,
  keys: string[],
  missingOnly = false,
): ControlsMap {
  const result = { ...target }
  let order = Math.max(0, ...Object.values(result).map((c) => c.order)) + 1

  for (const key of keys) {
    if (!source[key]) continue
    if (missingOnly && result[key]) continue
    result[key] = { ...source[key], order: result[key]?.order ?? order++ }
  }

  return result
}

export { compareFields } from './compareFields'
export { compareControls } from './compareControls'
