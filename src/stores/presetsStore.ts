import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ControlPreset } from '@/modules/control-presets'
import {
  getAllControlPresets,
  registerControlPreset,
  unregisterControlPreset,
} from '@/modules/control-presets'
import {
  getAllParameterPresets,
  unregisterParameterPreset,
} from '@/modules/parameter-presets'
import type { ControlSchema } from '@/modules/controls/types'

export const usePresetsStore = defineStore('presets', () => {
  const presetApplyMode = ref<'merge' | 'replace'>('merge')

  function saveControlAsPreset(control: ControlSchema, title: string, id?: string): ControlPreset {
    const preset: ControlPreset = {
      id: id ?? `custom_${control.key}_${Date.now()}`,
      title,
      target: 'any',
      isCustom: true,
      control: {
        type: control.type,
        validate: control.validate,
        options: control.options,
        file_types: control.file_types,
        max_size: control.max_size,
        builder_kind: control.builder_kind,
      },
    }
    registerControlPreset(preset)
    return preset
  }

  function deleteCustomControlPreset(id: string) {
    unregisterControlPreset(id)
  }

  function deleteCustomParameterPreset(id: string) {
    unregisterParameterPreset(id)
  }

  return {
    presetApplyMode,
    saveControlAsPreset,
    deleteCustomControlPreset,
    deleteCustomParameterPreset,
    getAllControlPresets,
    getAllParameterPresets,
  }
})
