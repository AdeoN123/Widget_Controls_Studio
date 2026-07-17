import { describe, it, expect } from 'vitest'
import { parseWidgetBlock } from '@/modules/widget-block/parser'
import { generateControls } from '@/modules/controls/generator'
import { mockFaqBlock } from '@/constants/mockFaqBlock'
import { compareControls, mergeControlsFromSource } from '@/modules/block-compare'

const parsed = parseWidgetBlock(mockFaqBlock)
const block = parsed.block!
const baseControls = generateControls(block)

describe('block-compare', () => {
  it('detects control differences', () => {
    const right = structuredClone(baseControls)
    right.title.type = 'textarea'

    const diff = compareControls(baseControls, right)
    const title = diff.find((d) => d.key === 'title')!
    expect(title.status).toBe('different')
    expect(title.differences).toContain('type')
  })

  it('merges missing controls from source', () => {
    const target = { ...baseControls }
    delete target.title_line_height
    const source = { ...baseControls, title_line_height: { ...baseControls.title_font_size, key: 'title_line_height' } }

    const merged = mergeControlsFromSource(target, source, ['title_line_height'], true)
    expect(merged.title_line_height).toBeDefined()
  })
})
