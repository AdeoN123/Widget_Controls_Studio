import type { BlockField } from '@/modules/widget-block/types'

const NAMING_RULES: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /^title_size$/, replacement: 'title_font_size' },
  { pattern: /^tablet_font_size_title$/, replacement: 'tablet_title_font_size' },
  { pattern: /^section_background_color$/, replacement: 'section_bg_color' },
  { pattern: /_background_color$/, replacement: '_bg_color' },
  { pattern: /_size$/, replacement: '_font_size' },
]

export function normalizeFieldKey(key: string): string {
  let result = key
  for (const rule of NAMING_RULES) {
    if (rule.pattern.test(result)) {
      result = result.replace(rule.pattern, rule.replacement)
    }
  }
  return result
}

export function normalizeFieldKeys(fields: BlockField[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const field of fields) {
    const normalized = normalizeFieldKey(field.key)
    if (normalized !== field.key) map.set(field.key, normalized)
  }
  return map
}

export function createBreakpointCopies(
  field: BlockField,
  breakpoints: Array<'tablet' | 'phone'>,
): BlockField[] {
  const baseKey = field.key.replace(/^(tablet_|phone_)/, '')
  return breakpoints.map((bp, i) => ({
    ...field,
    key: `${bp}_${baseKey}`,
    rawValue: field.rawValue,
    value: field.value,
    order: field.order + i + 1,
  }))
}
