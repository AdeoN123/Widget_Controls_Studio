import type { WidgetBlock } from '@/modules/widget-block/types'
import type { ControlsMap } from '@/modules/controls/types'

export function renameGroup(
  block: WidgetBlock,
  controls: ControlsMap,
  fromTitle: string,
  toTitle: string,
): { block: WidgetBlock; controls: ControlsMap } {
  const nextControls = { ...controls }

  for (const group of block.styleGroups) {
    if (group.title === fromTitle) {
      group.title = toTitle
      for (const field of group.fields) {
        field.groupTitle = toTitle
        if (nextControls[field.key]) {
          nextControls[field.key] = { ...nextControls[field.key], group: toTitle }
        }
      }
    }
  }

  return { block: { ...block }, controls: nextControls }
}
