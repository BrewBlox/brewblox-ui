<script setup lang="ts">
interface Props {
  editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
});

const emit = defineEmits<{
  click: [];
}>();

function edit(): void {
  if (props.editable) {
    emit('click');
  }
}
</script>

<template>
  <div
    :class="[
      'col-auto row justify-center q-py-sm rounded-borders',
      { clickable: editable },
    ]"
    @click="edit"
  >
    <div class="col-auto grid-container">
      <div
        v-if="$slots.header"
        class="grid-value text-h5 text-purple-3"
      >
        <slot name="header" />
      </div>

      <div class="grid-icon text-h5">
        <slot name="valueIcon" />
      </div>
      <div class="grid-value text-h6">
        <slot name="value" />
      </div>

      <div class="grid-icon">
        <slot name="settingIcon">
          <q-icon name="mdi-unfold-more-horizontal" />
        </slot>
      </div>
      <div class="grid-value text-h6">
        <slot name="setting" />
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.grid-container
  display: grid
  grid-template-columns: repeat(3, 50px)
  grid-row-gap: 5px
  grid-auto-flow: row

.grid-icon
  grid-column-end: span 1
  grid-column-start: 1
  height: 30px
  width: 30px
  margin-left: auto
  margin-right: auto

  > *
    min-width: 100%
    min-height: 100%
    width: 100%
    height: 100%

.grid-value
  grid-column-end: span 2
  grid-column-start: 2
  align-self: flex-end
</style>
