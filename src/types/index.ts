export type { DiagnosticItem, DiagnosticSeverity, DiagnosticCategory } from './diagnostics'
export { createDiagnostic } from './diagnostics'

export type {
  WidgetSectionKind,
  BlockSection,
  BlockField,
  StyleGroup,
  WidgetBlock,
  ParseResult,
  ParseMetadata,
  RequiredFieldKey,
} from '@/modules/widget-block/types'
export {
  REQUIRED_FIELD_ORDER,
  REQUIRED_FIELD_DEFAULTS,
} from '@/modules/widget-block/types'

export type {
  BuilderKind,
  ControlType,
  ControlValidate,
  ControlSchema,
  ControlsMap,
} from '@/modules/controls/types'
export {
  CONTROL_FIELD_ORDER,
  FONT_WEIGHT_OPTIONS,
  TEXT_ALIGN_OPTIONS,
} from '@/modules/controls/types'
