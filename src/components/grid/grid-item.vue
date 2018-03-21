<template>
  <div
    class="grid-item"
    :style="style"
    ref="container"
  >
    <slot />
    <div
      v-if="dragging"
      class="grid-item-drag-overlay"
      :style="dragStyle"
      ref="dragOverlay"
    >
      <div class="grid-item-resize-handle">
        <q-icon
          name="drag handle"
          size="18px"
        />
      </div>
    </div>
    <button
      class="grid-item-resize-handle"
      @mousedown="startResize"
      v-if="!dragging"
    >
      <q-icon
        name="drag handle"
        size="18px"
      />
    </button>
    <button
      class="grid-item-move-handle"
      @mousedown="startDrag"
      v-if="!dragging"
    >
      <q-icon
        name="drag handle"
        size="18px"
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
  width: 20px;
  height: 20px;
  background: transparent;
  position: absolute;
  right: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  outline: none;
  z-index: 2;
}

.grid-item-resize-handle {
  transform: rotate(-45deg);
  cursor: nwse-resize;
  bottom: 0;
}

.grid-item-move-handle {
  top: 0;
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
