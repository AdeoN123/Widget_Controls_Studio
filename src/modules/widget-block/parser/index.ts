import type {
  BlockField,
  BlockSection,
  ParseMetadata,
  ParseResult,
  StyleGroup,
  WidgetBlock,
} from '../types'
import { createDiagnostic } from '@/types/diagnostics'
import { parseBlockField } from './parseField'
import { parseControlsRaw } from './parseControls'
import { splitBlockIntoSections } from './splitSections'

function buildMetadata(block: WidgetBlock, controlsCount: number): ParseMetadata {
  const styleFieldsCount = block.styleGroups.reduce((sum, g) => sum + g.fields.length, 0)
  return {
    contentFieldsCount: block.content.length,
    styleFieldsCount,
    controlsCount,
    groupsCount: block.styleGroups.length,
  }
}

function emptyMetadata(): ParseMetadata {
  return {
    contentFieldsCount: 0,
    styleFieldsCount: 0,
    controlsCount: 0,
    groupsCount: 0,
  }
}

export function parseWidgetBlock(raw: string): ParseResult {
  const diagnostics = []
  const trimmed = raw.trim()

  if (!trimmed) {
    return {
      block: null,
      diagnostics: [
        createDiagnostic({
          severity: 'error',
          category: 'parse',
          code: 'EMPTY_BLOCK',
          message: 'Блок пустой',
        }),
      ],
      metadata: emptyMetadata(),
    }
  }

  const rawSections = splitBlockIntoSections(raw)
  const blockSections: BlockSection[] = rawSections.map((s) => ({
    title: s.title,
    kind: s.kind,
    order: s.order,
  }))

  const required: BlockField[] = []
  const content: BlockField[] = []
  const styleGroups: StyleGroup[] = []
  let controlsRaw: string | undefined
  let fieldOrder = 0

  let hasContent = false

  for (const section of rawSections) {
    if (section.kind === 'required') {
      for (const line of section.lines) {
        const parsed = parseBlockField(line)
        if (!parsed) {
          if (line.trim()) {
            diagnostics.push(
              createDiagnostic({
                severity: 'warning',
                category: 'parse',
                code: 'UNPARSED_LINE',
                message: `Не удалось разобрать строку: ${line.trim()}`,
                sectionTitle: section.title,
              }),
            )
          }
          continue
        }
        required.push({
          key: parsed.key,
          value: parsed.value,
          rawValue: parsed.rawValue,
          sectionKind: 'required',
          groupTitle: section.title,
          order: fieldOrder++,
        })
      }
    } else if (section.kind === 'content') {
      hasContent = true
      for (const line of section.lines) {
        const parsed = parseBlockField(line)
        if (!parsed) {
          if (line.trim()) {
            diagnostics.push(
              createDiagnostic({
                severity: 'warning',
                category: 'parse',
                code: 'UNPARSED_LINE',
                message: `Не удалось разобрать строку: ${line.trim()}`,
                sectionTitle: section.title,
              }),
            )
          }
          continue
        }
        content.push({
          key: parsed.key,
          value: parsed.value,
          rawValue: parsed.rawValue,
          sectionKind: 'content',
          groupTitle: section.title,
          order: fieldOrder++,
        })
      }
    } else if (section.kind === 'controls') {
      controlsRaw = section.lines.join('\n').trim()
    } else {
      const fields: BlockField[] = []
      for (const line of section.lines) {
        const parsed = parseBlockField(line)
        if (!parsed) {
          if (line.trim()) {
            diagnostics.push(
              createDiagnostic({
                severity: 'warning',
                category: 'parse',
                code: 'UNPARSED_LINE',
                message: `Не удалось разобрать строку: ${line.trim()}`,
                sectionTitle: section.title,
              }),
            )
          }
          continue
        }
        fields.push({
          key: parsed.key,
          value: parsed.value,
          rawValue: parsed.rawValue,
          sectionKind: 'style',
          groupTitle: section.title,
          order: fieldOrder++,
        })
      }
      styleGroups.push({
        title: section.title,
        order: section.order,
        fields,
      })
    }
  }

  if (!hasContent) {
    diagnostics.push(
      createDiagnostic({
        severity: 'info',
        category: 'parse',
        code: 'MISSING_CONTENT_SECTION',
        message: 'Отсутствует секция #Контент',
      }),
    )
  }

  const controlsParsed = controlsRaw ? parseControlsRaw(controlsRaw) : undefined
  const controlsCount = controlsParsed ? Object.keys(controlsParsed).length : 0

  const block: WidgetBlock = {
    raw,
    sections: blockSections,
    required,
    content,
    styleGroups,
    controlsRaw,
    controlsParsed,
  }

  return {
    block,
    diagnostics,
    metadata: buildMetadata(block, controlsCount),
  }
}

export { splitBlockIntoSections } from './splitSections'
export { parseBlockField } from './parseField'
export { parseControlsRaw } from './parseControls'
