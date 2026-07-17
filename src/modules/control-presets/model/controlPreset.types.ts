import type { ControlSchema } from '@/modules/controls/types'

export type ControlPresetTarget =
  | 'any'
  | 'content'
  | 'style'
  | 'numeric'
  | 'color'
  | 'file'
  | 'font_weight'
  | 'collection'
  | 'text'

export type PresetApplyMode = 'replace' | 'merge'

export interface ControlPreset {
  id: string
  title: string
  description?: string
  target: ControlPresetTarget
  control: Partial<ControlSchema>
  tags?: string[]
  isCustom?: boolean
}

export interface ControlPresetApplyResult {
  control: ControlSchema
  presetId: string
  mode: PresetApplyMode
}
