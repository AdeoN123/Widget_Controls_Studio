import type { ControlPreset } from '../model/controlPreset.types'

export const builtinControlPresets: ControlPreset[] = [
  {
    id: 'numeric_text_control',
    title: 'Numeric Textfield',
    target: 'numeric',
    control: {
      type: 'textfield',
      validate: { digits: 'true' },
    },
    tags: ['numeric', 'validate'],
  },
  {
    id: 'font_weight_select_control',
    title: 'Font Weight Radio',
    target: 'font_weight',
    control: {
      type: 'radio',
      options: { light: '300', normal: '400', medium: '500', bold: '700' },
    },
    tags: ['typography'],
  },
  {
    id: 'color_control',
    title: 'Color Control',
    target: 'color',
    control: { type: 'color' },
    tags: ['color'],
  },
  {
    id: 'image_file_control',
    title: 'Image File Control',
    target: 'file',
    control: {
      type: 'file',
      file_types: 'image/jpeg,image/png,image/gif,image/svg+xml',
      max_size: '204800',
    },
    tags: ['file', 'image'],
  },
  {
    id: 'textarea_content_control',
    title: 'Textarea Content',
    target: 'content',
    control: { type: 'textarea' },
    tags: ['content'],
  },
  {
    id: 'title_text_control',
    title: 'Title Textfield',
    target: 'text',
    control: { type: 'textfield' },
    tags: ['content', 'text'],
  },
  {
    id: 'collection_control',
    title: 'Collection',
    target: 'collection',
    control: { type: 'collection' },
    tags: ['content', 'collection'],
  },
]
