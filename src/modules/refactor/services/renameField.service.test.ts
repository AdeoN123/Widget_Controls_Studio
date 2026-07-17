import { describe, it, expect } from 'vitest'
import { parseWidgetBlock } from '@/modules/widget-block/parser'
import { generateControls } from '@/modules/controls/generator'
import { mockFaqBlock } from '@/constants/mockFaqBlock'
import { renameField } from '@/modules/refactor/services/renameField.service'

const parsed = parseWidgetBlock(mockFaqBlock)
const block = parsed.block!
const baseControls = generateControls(block)

describe('rename-field.service', () => {
  it('renames field and linked control', () => {
    const testBlock = structuredClone(block)
    const testControls = structuredClone(baseControls)
    const result = renameField(testBlock, testControls, 'title', 'faq_title')
    expect(result?.renamedTo).toBe('faq_title')
    expect(result?.controls.faq_title?.key).toBe('faq_title')
    expect(result?.controls.title).toBeUndefined()
    expect(result?.block.content.some((f) => f.key === 'faq_title')).toBe(true)
  })
})
