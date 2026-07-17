export type {
  BlockCompareResult,
  FieldCompareItem,
  ControlCompareItem,
  SectionCompareItem,
} from './model/compare.types'

export {
  compareBlocks,
  mergeControlsFromSource,
  compareFields,
  compareControls,
} from './services/compareBlocks'
