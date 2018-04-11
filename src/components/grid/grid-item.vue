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
          name="mdi-resize-bottom-right"
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
      v-if="!dragging && !moving && editable"
    >
      <q-icon
        name="mdi-resize-bottom-right"
        size="30px"
      />
    </button>
    <button
      class="grid-item-move-handle"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @touchmove="onDragMove"
      @touchend="stopDrag"
      v-if="!dragging && editable"
    />
  </div>
</template>

<script lang="ts" src="./grid-item.ts" />

<style scoped>
.grid-item {
  position: relative;
}

.grid-item-resize-handle {
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
  cursor: nwse-resize;
  right: 0;
}

.grid-item-move-handle {
  left: 0;
  top: 0;
  position: absolute;
  background: transparent;
  border: 0;
  cursor: move;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.grid-item-drag-overlay {
  background: rgba(255, 255, 255, 0.2);
  top: 0;
  bottom: 0;
  position: absolute;
  z-index: 1;
}
</style>
