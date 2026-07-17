import type { WidgetBlock } from '@/modules/widget-block/types'
import type { BlockField } from '@/modules/widget-block/types'

export function moveFieldsToSection(
  block: WidgetBlock,
  fieldKeys: string[],
  targetSection: string,
  targetKind: 'content' | 'style',
): WidgetBlock {
  const keysSet = new Set(fieldKeys)
  const moved: BlockField[] = []

  const extract = (fields: BlockField[]) => {
    const remaining: BlockField[] = []
    for (const f of fields) {
      if (keysSet.has(f.key)) {
        moved.push({
          ...f,
          sectionKind: targetKind,
          groupTitle: targetKind === 'content' ? 'Контент' : targetSection,
        })
      } else {
        remaining.push(f)
      }
    }
    return remaining
  }

  const next = { ...block, content: [...block.content], styleGroups: block.styleGroups.map((g) => ({ ...g, fields: [...g.fields] })) }

  next.required = extract(next.required)
  next.content = extract(next.content)
  for (const group of next.styleGroups) {
    group.fields = extract(group.fields)
  }

  if (targetKind === 'content') {
    next.content.push(...moved)
  } else {
    let group = next.styleGroups.find((g) => g.title === targetSection)
    if (!group) {
      group = { title: targetSection, order: next.styleGroups.length, fields: [] }
      next.styleGroups.push(group)
    }
    group.fields.push(...moved)
  }

  return next
}
