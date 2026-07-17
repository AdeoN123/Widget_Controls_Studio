export type ParameterPresetScope =
  | 'section'
  | 'title'
  | 'text'
  | 'button'
  | 'image'
  | 'custom'

export type ParameterPresetMode = 'add_missing' | 'append_all' | 'replace_conflicting'

export interface ParameterPresetField {
  key: string
  defaultValue: string
  controlPresetId?: string
}

export interface ParameterPreset {
  id: string
  title: string
  description?: string
  scope: ParameterPresetScope
  fields: ParameterPresetField[]
  isCustom?: boolean
}
