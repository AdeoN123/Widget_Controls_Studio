import { describe, it, expect } from 'vitest'
import { parseWidgetBlock } from '@/modules/widget-block/parser'
import { generateControls } from '@/modules/controls/generator'
import { mockFaqBlock } from '@/constants/mockFaqBlock'
import { renameGroup } from '@/modules/refactor/services/renameGroup.service'

const parsed = parseWidgetBlock(mockFaqBlock)
const block = parsed.block!
const baseControls = generateControls(block)

describe('rename-group.service', () => {
  it('renames style group and updates control groups', () => {
    const testBlock = structuredClone(block)
    const testControls = structuredClone(baseControls)
    const result = renameGroup(testBlock, testControls, 'Заголовок', 'Заголовок FAQ')
    const group = result.block.styleGroups.find((g) => g.title === 'Заголовок FAQ')
    expect(group).toBeDefined()
    expect(result.controls.title_font_size.group).toBe('Заголовок FAQ')
  })
})
