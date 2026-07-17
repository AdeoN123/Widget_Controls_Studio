export type Breakpoint = 'desktop' | 'tablet' | 'phone'

export type PropertyType =
  | 'font_size'
  | 'padding'
  | 'margin'
  | 'color'
  | 'image'
  | 'font_weight'
  | 'font_family'
  | 'align'
  | 'unknown'

export interface FieldMeta {
  isContent: boolean
  isStyle: boolean
  isNumeric: boolean
  isColor: boolean
  isImage: boolean
  isCollection: boolean
  breakpoint: Breakpoint
  propertyType: PropertyType
  group: string
}

export type { Breakpoint as FieldBreakpoint, PropertyType as FieldPropertyType }
