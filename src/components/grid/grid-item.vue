<template>
  <div
    class="grid-item"
    :style="style"
    ref="container"
  >
    <slot />
    <div
      v-if="dragging || moving"
      class="grid-item-drag-overlay"
      :style="dragStyle"
      ref="dragOverlay"
    >
      <div
        v-if="!moving"
        class="grid-item-resize-handle"
      >
        <q-icon
          name="drag handle"
          size="30px"
        />
      </div>
    </div>
    <button
      class="grid-item-resize-handle"
      @mousedown="startResize"
      @touchstart="startResize"
      @touchmove="onResizeMove"
      @touchend="stopResize"
      v-if="!dragging && !moving"
    >
      <q-icon
        name="drag handle"
        size="30px"
      />
    </button>
    <button
      class="grid-item-move-handle"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @touchmove="onDragMove"
      @touchend="stopDrag"
      v-if="!dragging"
    >
      <q-icon
        name="drag handle"
        size="30px"
      />
    </button>
  </div>
</template>

<script lang="ts" src="./grid-item.ts" />

<style scoped>
.grid-item {
  position: relative;
}

.grid-item-resize-handle, .grid-item-move-handle {
  border: 0;
  width: 34px;
  height: 34px;
  background: transparent;
  position: absolute;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  outline: none;
  z-index: 2;
  bottom: 0;
}

.grid-item-resize-handle {
  transform: rotate(-45deg);
  cursor: nwse-resize;
  right: 0;
}

.grid-item-move-handle {
  left: 0;
  cursor: move;
}

.grid-item-drag-overlay {
  background: rgba(255, 255, 255, 0.2);
  top: 0;
  bottom: 0;
  position: absolute;
  z-index: 1;
}
</style>
