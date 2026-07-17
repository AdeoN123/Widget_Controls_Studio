<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  direction?: 'horizontal' | 'vertical'
  initial?: number
  min?: number
  max?: number
  side?: 'left' | 'right'
}>()

const emit = defineEmits<{ resize: [size: number] }>()

const size = ref(props.initial ?? 240)
const dragging = ref(false)

function onMouseDown(event: MouseEvent) {
  dragging.value = true
  const start = props.direction === 'vertical' ? event.clientY : event.clientX
  const startSize = size.value

  function onMove(e: MouseEvent) {
    const current = props.direction === 'vertical' ? e.clientY : e.clientX
    const delta = current - start
    let next: number
    if (props.direction === 'vertical') {
      next = startSize + delta
    } else if (props.side === 'right') {
      next = startSize - delta
    } else {
      next = startSize + delta
    }
    const min = props.min ?? 160
    const max = props.max ?? 600
    size.value = Math.min(max, Math.max(min, next))
    emit('resize', size.value)
  }

  function onUp() {
    dragging.value = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

onMounted(() => {
  if (props.initial) emit('resize', props.initial)
})
</script>

<template>
  <div
    class="resize-handle"
    :class="[
      `resize-handle--${direction ?? 'horizontal'}`,
      { 'resize-handle--active': dragging },
    ]"
    @mousedown.prevent="onMouseDown"
  />
</template>

<style scoped>
.resize-handle {
  flex-shrink: 0;
  background: var(--color-border-subtle);
  transition: background 150ms;
  z-index: 2;
}

.resize-handle--horizontal {
  width: 4px;
  cursor: col-resize;
}

.resize-handle--vertical {
  height: 4px;
  cursor: row-resize;
  width: 100%;
}

.resize-handle:hover,
.resize-handle--active {
  background: var(--color-accent);
}
</style>
