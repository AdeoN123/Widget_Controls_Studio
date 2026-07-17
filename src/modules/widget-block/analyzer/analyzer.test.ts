import { describe, it, expect } from 'vitest'
import { analyzeField, detectBreakpoint, detectPropertyType } from './index'
import type { BlockField } from '../types'

function field(partial: Partial<BlockField> & { key: string }): BlockField {
  return {
    value: '',
    rawValue: '""',
    sectionKind: 'style',
    order: 0,
    ...partial,
  }
}

describe('analyzeField', () => {
  it('detects font_size property type', () => {
    const meta = analyzeField(field({ key: 'title_font_size', sectionKind: 'style', groupTitle: 'Заголовок' }))
    expect(meta.propertyType).toBe('font_size')
    expect(meta.isStyle).toBe(true)
    expect(meta.isNumeric).toBe(true)
    expect(meta.group).toBe('Заголовок')
  })

  it('detects phone breakpoint', () => {
    const meta = analyzeField(field({ key: 'phone_title_font_size' }))
    expect(meta.breakpoint).toBe('phone')
    expect(detectBreakpoint('phone_title_font_size')).toBe('phone')
  })

  it('detects color fields', () => {
    const meta = analyzeField(field({ key: 'section_bg_color', groupTitle: 'Общее' }))
    expect(meta.isColor).toBe(true)
    expect(meta.propertyType).toBe('color')
    expect(meta.group).toBe('Общее')
  })

  it('detects content collection', () => {
    const meta = analyzeField(
      field({ key: 'questions', sectionKind: 'content', groupTitle: 'Контент' }),
    )
    expect(meta.isContent).toBe(true)
    expect(meta.isCollection).toBe(true)
    expect(meta.group).toBe('Контент')
  })

  it('detects property types directly', () => {
    expect(detectPropertyType('title_font_size')).toBe('font_size')
    expect(detectPropertyType('section_padding_top')).toBe('padding')
  })
})
