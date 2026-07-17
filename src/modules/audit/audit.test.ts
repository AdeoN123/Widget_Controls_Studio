import { describe, it, expect } from 'vitest'
import { parseWidgetBlock } from '@/modules/widget-block/parser'
import { generateControls } from '@/modules/controls/generator'
import { mockFaqBlock } from '@/constants/mockFaqBlock'
import { runAudit } from '@/modules/audit'

const parsed = parseWidgetBlock(mockFaqBlock)
const block = parsed.block!
const baseControls = generateControls(block)

describe('audit', () => {
  it('flags missing controls', () => {
    const partial = { ...baseControls }
    delete partial.title

    const items = runAudit(block, partial)
    expect(items.some((i) => i.filter === 'missing_controls')).toBe(true)
  })

  it('flags orphan controls', () => {
    const withOrphan = { ...baseControls, stray: { ...baseControls.title, key: 'stray' } }
    const items = runAudit(block, withOrphan)
    expect(items.some((i) => i.filter === 'orphan_controls')).toBe(true)
  })
})
