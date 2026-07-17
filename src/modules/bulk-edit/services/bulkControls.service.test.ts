import { describe, it, expect } from 'vitest'
import { parseWidgetBlock } from '@/modules/widget-block/parser'
import { generateControls } from '@/modules/controls/generator'
import { mockFaqBlock } from '@/constants/mockFaqBlock'
import { applyBulkControlPatch, applyBulkControlPreset } from '@/modules/bulk-edit/services/bulkControls.service'

const parsed = parseWidgetBlock(mockFaqBlock)
const block = parsed.block!
const baseControls = generateControls(block)

describe('bulk-controls.service', () => {
  it('bulk applies preset to selected controls', () => {
    const broken = { ...baseControls }
    delete broken.section_padding_top.validate

    const next = applyBulkControlPreset(broken, ['section_padding_top'], 'numeric_text_control', 'merge')
    expect(next.section_padding_top.validate).toEqual({ digits: 'true' })
  })

  it('patches group for multiple controls', () => {
    const keys = ['title_font_size', 'title_font_weight']
    const next = applyBulkControlPatch(baseControls, keys, { group: 'Заголовок v2' })
    expect(next.title_font_size.group).toBe('Заголовок v2')
    expect(next.title_font_weight.group).toBe('Заголовок v2')
  })
})
