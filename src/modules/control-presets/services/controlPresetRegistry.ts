import type { ControlPreset } from '../model/controlPreset.types'
import { builtinControlPresets } from '../presets/builtin.presets'

const registry = new Map<string, ControlPreset>()

for (const preset of builtinControlPresets) {
  registry.set(preset.id, preset)
}

export function getAllControlPresets(): ControlPreset[] {
  return [...registry.values()]
}

export function getControlPresetById(id: string): ControlPreset | null {
  return registry.get(id) ?? null
}

export function registerControlPreset(preset: ControlPreset): void {
  registry.set(preset.id, preset)
}

export function unregisterControlPreset(id: string): void {
  const existing = registry.get(id)
  if (existing?.isCustom) registry.delete(id)
}

export function getBuiltinControlPresets(): ControlPreset[] {
  return getAllControlPresets().filter((p) => !p.isCustom)
}

export function getCustomControlPresets(): ControlPreset[] {
  return getAllControlPresets().filter((p) => p.isCustom)
}
