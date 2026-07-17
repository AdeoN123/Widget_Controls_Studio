import { describe, it, expect } from 'vitest'
import { parseWidgetBlock } from './index'
import { mockFaqBlock } from '@/constants/mockFaqBlock'
import { generateControls } from '@/modules/controls/generator'
import { repairControls } from '@/modules/controls/repair'
import { exportWidgetBlock } from '@/modules/widget-block/serializer'
import { normalizeWidgetBlock, normalizeControlsOrder } from '@/modules/widget-block/normalizer'
import { validateAll } from '@/modules/widget-block/validators'

describe('Phase 2 integration — mock FAQ block', () => {
  const parsed = parseWidgetBlock(mockFaqBlock)

  it('parses structure with metadata', () => {
    expect(parsed.block).not.toBeNull()
    expect(parsed.metadata.contentFieldsCount).toBe(3)
    expect(parsed.metadata.styleFieldsCount).toBeGreaterThan(0)
    expect(parsed.metadata.groupsCount).toBeGreaterThan(0)
    expect(parsed.block?.sections.length).toBeGreaterThan(0)
  })

  it('generates controls for all editable fields', () => {
    const block = parsed.block!
    const controls = generateControls(block)
    const editableCount = block.content.length + parsed.metadata.styleFieldsCount
    expect(Object.keys(controls).length).toBe(editableCount)
    expect(controls.title?.group).toBe('Заголовок')
    expect(controls.section_padding_top?.validate).toEqual({ digits: 'true' })
    expect(controls.title_font_weight?.type).toBe('radio')
    expect(controls.title_font_weight?.options).toEqual({
      light: '300',
      normal: '400',
      medium: '500',
      bold: '700',
    })
  })

  it('repairs wrong group and validate', () => {
    const block = parsed.block!
    const broken = generateControls(block)
    broken.section_padding_top = {
      ...broken.section_padding_top,
      group: 'Wrong',
      validate: undefined,
    }
    const repaired = repairControls(block, broken)
    expect(repaired.section_padding_top.group).toBe('Общее')
    expect(repaired.section_padding_top.validate).toEqual({ digits: 'true' })
  })

  it('normalizes block field order by breakpoint', () => {
    const block = parsed.block!
    const shuffled = {
      ...block,
      styleGroups: block.styleGroups.map((g) => {
        if (g.title !== 'Заголовок') return g
        const fields = [...g.fields].reverse()
        return { ...g, fields }
      }),
    }
    const normalized = normalizeWidgetBlock(shuffled)
    const titleGroup = normalized.styleGroups.find((g) => g.title === 'Заголовок')!
    const keys = titleGroup.fields.map((f) => f.key)
    expect(keys.indexOf('title_font_size')).toBeLessThan(keys.indexOf('tablet_title_font_size'))
    expect(keys.indexOf('tablet_title_font_size')).toBeLessThan(keys.indexOf('phone_title_font_size'))
  })

  it('exports valid widget block', () => {
    const block = parsed.block!
    const controls = generateControls(block)
    const exported = exportWidgetBlock(block, controls)
    expect(exported.startsWith('#Обязательное')).toBe(true)
    expect(exported).toContain('#Контент')
    expect(exported).toContain('#Контролы')
    expect(exported).toContain('preview_url:')
    expect(exported).toContain('group: "Контент"')
    expect(exported).toContain('builder_kind: "design-desktop"')
  })

  it('re-parses exported block', () => {
    const block = parsed.block!
    const controls = normalizeControlsOrder(block, generateControls(block))
    const exported = exportWidgetBlock(normalizeWidgetBlock(block), controls)
    const reParsed = parseWidgetBlock(exported)
    expect(reParsed.block?.content.length).toBe(block.content.length)
    expect(reParsed.metadata.controlsCount).toBe(Object.keys(controls).length)
  })

  it('validates generated controls without critical errors', () => {
    const block = parsed.block!
    const controls = repairControls(block, generateControls(block))
    const issues = validateAll(block, controls)
    const errors = issues.filter((d) => d.severity === 'error')
    expect(errors).toHaveLength(0)
  })
})

describe('parseWidgetBlock', () => {
  it('returns error for empty block', () => {
    const result = parseWidgetBlock('')
    expect(result.block).toBeNull()
    expect(result.metadata.controlsCount).toBe(0)
  })
})
