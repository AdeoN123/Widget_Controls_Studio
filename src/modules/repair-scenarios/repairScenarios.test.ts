import { describe, it, expect } from 'vitest'
import { parseWidgetBlock } from '@/modules/widget-block/parser'
import { generateControls } from '@/modules/controls/generator'
import { mockFaqBlock } from '@/constants/mockFaqBlock'
import { runRepairScenario } from '@/modules/repair-scenarios'

const parsed = parseWidgetBlock(mockFaqBlock)
const block = parsed.block!
const baseControls = generateControls(block)

describe('repair-scenarios', () => {
  it('repairs numeric controls validate', () => {
    const broken = structuredClone(baseControls)
    broken.section_padding_top = { ...broken.section_padding_top, validate: undefined }

    const result = runRepairScenario('repair-numeric-controls', block, broken, { scope: 'block' })
    expect(result?.controls.section_padding_top.validate?.digits).toBe('true')
    expect(result?.affected.length).toBeGreaterThan(0)
  })

  it('removes orphan controls only', () => {
    const withOrphan = { ...baseControls, orphan_key: { ...baseControls.title, key: 'orphan_key' } }
    const result = runRepairScenario('remove-orphan-controls', block, withOrphan, { scope: 'block' })
    expect(result?.controls.orphan_key).toBeUndefined()
  })
})
