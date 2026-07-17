import type { ParameterPreset } from '../model/parameterPreset.types'

export const typographyTitlePreset: ParameterPreset = {
  id: 'typography_title',
  title: 'Typography — Title',
  description: 'Стандартная типографика заголовка',
  scope: 'title',
  fields: [
    { key: 'title_font_size', defaultValue: '"52"', controlPresetId: 'numeric_text_control' },
    { key: 'tablet_title_font_size', defaultValue: '"46"', controlPresetId: 'numeric_text_control' },
    { key: 'phone_title_font_size', defaultValue: '"27"', controlPresetId: 'numeric_text_control' },
    { key: 'title_font_weight', defaultValue: '"700"', controlPresetId: 'font_weight_select_control' },
    { key: 'title_line_height', defaultValue: '"1.2"', controlPresetId: 'numeric_text_control' },
    { key: 'title_color', defaultValue: '"#333333"', controlPresetId: 'color_control' },
  ],
}

export const typographyTextPreset: ParameterPreset = {
  id: 'typography_text',
  title: 'Typography — Text',
  scope: 'text',
  fields: [
    { key: 'text_font_size', defaultValue: '"16"', controlPresetId: 'numeric_text_control' },
    { key: 'tablet_text_font_size', defaultValue: '"14"', controlPresetId: 'numeric_text_control' },
    { key: 'phone_text_font_size', defaultValue: '"13"', controlPresetId: 'numeric_text_control' },
    { key: 'text_line_height', defaultValue: '"1.5"', controlPresetId: 'numeric_text_control' },
    { key: 'text_color', defaultValue: '"#333333"', controlPresetId: 'color_control' },
  ],
}

export const sectionBackgroundPreset: ParameterPreset = {
  id: 'section_background',
  title: 'Section Background',
  scope: 'section',
  fields: [
    { key: 'section_bg_color', defaultValue: '"rgb(255, 255, 255)"', controlPresetId: 'color_control' },
    { key: 'section_bg_image', defaultValue: '""', controlPresetId: 'image_file_control' },
  ],
}

export const buttonPreset: ParameterPreset = {
  id: 'button_styles',
  title: 'Button Styles',
  scope: 'button',
  fields: [
    { key: 'button_font_size', defaultValue: '"16"', controlPresetId: 'numeric_text_control' },
    { key: 'button_font_weight', defaultValue: '"500"', controlPresetId: 'font_weight_select_control' },
    { key: 'button_color', defaultValue: '"#ffffff"', controlPresetId: 'color_control' },
    { key: 'button_bg_color', defaultValue: '"#4885ff"', controlPresetId: 'color_control' },
    { key: 'button_radius', defaultValue: '"8"', controlPresetId: 'numeric_text_control' },
    { key: 'button_padding_top', defaultValue: '"12"', controlPresetId: 'numeric_text_control' },
    { key: 'button_padding_right', defaultValue: '"24"', controlPresetId: 'numeric_text_control' },
    { key: 'button_padding_bottom', defaultValue: '"12"', controlPresetId: 'numeric_text_control' },
    { key: 'button_padding_left', defaultValue: '"24"', controlPresetId: 'numeric_text_control' },
  ],
}

export const spacingPreset: ParameterPreset = {
  id: 'section_spacing',
  title: 'Section Spacing',
  scope: 'section',
  fields: [
    { key: 'section_padding_top', defaultValue: '"70"', controlPresetId: 'numeric_text_control' },
    { key: 'section_padding_bottom', defaultValue: '"70"', controlPresetId: 'numeric_text_control' },
  ],
}

export const builtinParameterPresets: ParameterPreset[] = [
  typographyTitlePreset,
  typographyTextPreset,
  sectionBackgroundPreset,
  buttonPreset,
  spacingPreset,
]
