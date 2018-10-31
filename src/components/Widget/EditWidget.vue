<script lang="ts">
import Component from 'vue-class-component';
import WidgetBase from './WidgetBase';

@Component({
  props: {
    onDeleteItem: {
      type: Function,
      required: false,
    },
    onCopyItem: {
      type: Function,
      required: false,
    },
    onMoveItem: {
      type: Function,
      required: false,
    },
  },
})
export default class EditWidget extends WidgetBase { }
</script>

<template>
  <widget-card
    :title="$props.id"
    :subTitle="$props.type"
    :additionalInfo="additionalInfo"
  >
    <q-list
      class="actions-container"
      no-border
    >
      <q-btn
        flat
        size="lg"
        icon="delete"
        v-if="$props.onDeleteItem"
        @click="$props.onDeleteItem"
      />
      <q-btn
        flat
        size="lg"
        icon="file_copy"
        v-if="$props.onCopyItem"
        @click="$props.onCopyItem"
      />
      <q-btn
        flat
        size="lg"
        icon="exit_to_app"
        v-if="$props.onMoveItem"
        @click="$props.onMoveItem"
      />
    </q-list>
  </widget-card>
</template>

<style scoped>
.actions-container {
  background: transparent;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  position: absolute;
  right: 0;
}
</style>

