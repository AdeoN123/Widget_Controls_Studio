import type { WidgetBlock } from '@/modules/widget-block/types'
import type { ControlsMap } from '@/modules/controls/types'

export type RepairScope = 'block' | 'section' | 'fields' | 'controls'

export interface RepairScenarioContext {
  scope: RepairScope
  sectionTitle?: string
  fieldKeys?: string[]
  controlKeys?: string[]
}

export interface RepairScenarioResult {
  block: WidgetBlock
  controls: ControlsMap
  affected: string[]
  message: string
}

export interface RepairScenario {
  id: string
  title: string
  description?: string
  previewCount: (block: WidgetBlock, controls: ControlsMap, ctx: RepairScenarioContext) => number
  run: (
    block: WidgetBlock,
    controls: ControlsMap,
    ctx: RepairScenarioContext,
  ) => RepairScenarioResult
}
