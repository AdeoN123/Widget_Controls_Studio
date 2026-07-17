import type { WidgetBlock } from '@/modules/widget-block/types'
import type { ControlsMap } from '@/modules/controls/types'
import type { BlockField } from '@/modules/widget-block/types'

export type CompareSide = 'left' | 'right'

export interface FieldCompareItem {
  key: string
  status: 'only_left' | 'only_right' | 'different' | 'same'
  leftValue?: unknown
  rightValue?: unknown
}

export interface ControlCompareItem {
  key: string
  status: 'only_left' | 'only_right' | 'different' | 'same'
  differences: string[]
}

export interface SectionCompareItem {
  title: string
  status: 'only_left' | 'only_right' | 'different' | 'same'
  leftCount: number
  rightCount: number
}

export interface BlockCompareResult {
  fields: FieldCompareItem[]
  controls: ControlCompareItem[]
  sections: SectionCompareItem[]
}
