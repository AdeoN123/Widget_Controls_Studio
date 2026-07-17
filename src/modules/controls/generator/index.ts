import type { WidgetBlock } from '@/modules/widget-block/types'
import type { ControlsMap } from '@/modules/controls/types'
import { buildStyleTopicMap } from '@/modules/widget-block/analyzer'
import { defaultRules, inferControlForField } from './rules'

export function generateControls(
  block: WidgetBlock,
  rules = defaultRules,
): ControlsMap {
  const controls: ControlsMap = {}
  let order = 0

  const styleTopicMap = buildStyleTopicMap(block.styleGroups)

  const orderedFields = [
    ...block.content,
    ...block.styleGroups
      .slice()
      .sort((a, b) => a.order - b.order)
      .flatMap((g) => g.fields),
  ]

  for (const field of orderedFields) {
    const control = inferControlForField(field, rules, styleTopicMap)
    if (control) {
      controls[field.key] = { ...control, order: order++ }
    }
  }

  return controls
}

export { inferControlForField, defaultRules } from './rules'
export type { ControlRule } from './rules'
