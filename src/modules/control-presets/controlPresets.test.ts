import { describe, it, expect } from 'vitest'
import { parseWidgetBlock } from '@/modules/widget-block/parser'
import { generateControls } from '@/modules/controls/generator'
import { mockFaqBlock } from '@/constants/mockFaqBlock'
import { applyControlPreset, getControlPresetById, getMatchingControlPresets } from '@/modules/control-presets'
import type { ControlSchema } from '@/modules/controls/types'

const parsed = parseWidgetBlock(mockFaqBlock)
const block = parsed.block!
const baseControls = generateControls(block)

describe('control-presets', () => {
  it('applies preset in merge mode without dropping existing group', () => {
    const preset = getControlPresetById('numeric_text_control')!
    const control: ControlSchema = {
      ...baseControls.section_padding_top,
      validate: undefined,
      group: 'Общее',
    }

    const merged = applyControlPreset(control, preset, 'merge')
    expect(merged.group).toBe('Общее')
    expect(merged.key).toBe('section_padding_top')
    expect(merged.validate).toEqual({ digits: 'true' })
    expect(merged.type).toBe('textfield')
  })

  it('keeps the control\'s existing type in merge mode instead of the preset\'s', () => {
    const preset = getControlPresetById('font_weight_select_control')!
    const control: ControlSchema = {
      ...baseControls.title_font_weight,
      type: 'textfield',
    }

    const merged = applyControlPreset(control, preset, 'merge')
    expect(merged.type).toBe('textfield')
  })

  it('applies preset in replace mode', () => {
    const preset = getControlPresetById('font_weight_select_control')!
    const control: ControlSchema = {
      ...baseControls.title_font_weight,
      type: 'textfield',
      options: { '100': '100' },
    }

    const replaced = applyControlPreset(control, preset, 'replace')
    expect(replaced.type).toBe('radio')
    expect(replaced.options).toEqual({ light: '300', normal: '400', medium: '500', bold: '700' })
    expect(replaced.key).toBe('title_font_weight')
    expect(replaced.group).toBe('Заголовок')
  })

  it('suggests matching presets for numeric fields', () => {
    const field = block.styleGroups.find((g) => g.title === 'Заголовок')!.fields[0]
    const matches = getMatchingControlPresets(field)
    expect(matches.some((p) => p.id === 'numeric_text_control')).toBe(true)
  })
})
