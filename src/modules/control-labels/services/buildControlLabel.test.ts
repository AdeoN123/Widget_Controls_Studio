import { describe, it, expect } from 'vitest'
import { parseWidgetBlock } from '@/modules/widget-block/parser'
import { generateControls } from '@/modules/controls/generator'
import { mockFaqBlock } from '@/constants/mockFaqBlock'
import { buildControlLabel } from '@/modules/control-labels'
import { analyzeField } from '@/modules/widget-block/analyzer'

const parsed = parseWidgetBlock(mockFaqBlock)
const block = parsed.block!
generateControls(block)

describe('build-control-label', () => {
  it('builds human-readable labels', () => {
    const field = block.styleGroups.find((g) => g.title === 'Заголовок')!.fields.find((f) => f.key === 'title_font_size')!
    const label = buildControlLabel(field, analyzeField(field))
    expect(label).toContain('px')
  })

  it('builds font weight label', () => {
    const field = block.styleGroups.find((g) => g.title === 'Заголовок')!.fields.find((f) => f.key === 'title_font_weight')!
    expect(buildControlLabel(field, analyzeField(field))).toBe('Жирность шрифта')
  })
})
