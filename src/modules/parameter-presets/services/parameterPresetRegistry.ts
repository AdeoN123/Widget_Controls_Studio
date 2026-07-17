import type { ParameterPreset } from '../model/parameterPreset.types'
import { builtinParameterPresets } from '../presets/builtin.presets'

const registry = new Map<string, ParameterPreset>()

for (const preset of builtinParameterPresets) {
  registry.set(preset.id, preset)
}

export function getAllParameterPresets(): ParameterPreset[] {
  return [...registry.values()]
}

export function getParameterPresetById(id: string): ParameterPreset | null {
  return registry.get(id) ?? null
}

export function registerParameterPreset(preset: ParameterPreset): void {
  registry.set(preset.id, preset)
}

export function unregisterParameterPreset(id: string): void {
  const p = registry.get(id)
  if (p?.isCustom) registry.delete(id)
}
