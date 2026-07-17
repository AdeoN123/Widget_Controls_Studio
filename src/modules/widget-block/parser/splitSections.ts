import type { WidgetSectionKind } from '../types'
import { detectSectionKind, isSectionHeader, parseSectionTitle } from './sectionUtils'

export interface RawSection {
  title: string
  kind: WidgetSectionKind
  lines: string[]
  order: number
}

export function splitBlockIntoSections(raw: string): RawSection[] {
  const lines = raw.split('\n')
  const sections: RawSection[] = []
  let current: RawSection | null = null
  let order = 0

  for (const line of lines) {
    if (isSectionHeader(line)) {
      if (current) sections.push(current)
      const title = parseSectionTitle(line)
      current = {
        title,
        kind: detectSectionKind(title),
        lines: [],
        order: order++,
      }
      continue
    }

    if (!current) {
      if (line.trim()) {
        current = {
          title: 'Обязательное',
          kind: 'required',
          lines: [],
          order: order++,
        }
        current.lines.push(line)
      }
      continue
    }

    current.lines.push(line)
  }

  if (current) sections.push(current)
  return sections
}
