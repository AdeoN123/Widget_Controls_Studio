import { describe, it, expect } from 'vitest'
import { parseWidgetBlock } from '@/modules/widget-block/parser'
import { generateControls } from '@/modules/controls/generator'
import { mockFaqBlock } from '@/constants/mockFaqBlock'
import { applyParameterPreset } from '@/modules/parameter-presets'
import { typographyTitlePreset } from '@/modules/parameter-presets/presets/builtin.presets'

const parsed = parseWidgetBlock(mockFaqBlock)
const block = parsed.block!
const baseControls = generateControls(block)

describe('parameter-presets', () => {
  it('adds missing typography fields to title section', () => {
    const slimBlock = structuredClone(block)
    const titleGroup = slimBlock.styleGroups.find((g) => g.title === 'Заголовок')!
    titleGroup.fields = titleGroup.fields.filter((f) => f.key !== 'title_line_height' && f.key !== 'title_color')

    const result = applyParameterPreset(slimBlock, baseControls, typographyTitlePreset, 'Заголовок', 'add_missing')
    expect(result.addedFields).toContain('title_line_height')
    expect(result.addedFields).toContain('title_color')
    expect(result.controls.title_color?.type).toBe('color')
  })
})
