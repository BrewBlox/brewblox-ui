<script lang="ts">
import Component from 'vue-class-component';
import WidgetBase from './WidgetBase';

@Component
export default class EditWidget extends WidgetBase { }
</script>

<template>
  <q-card dark class="column">
    <q-card-title class="title-bar">
      <InputPopupEdit :field="widgetId" :change="v => widgetId = v" label="Widget ID" tag="span"/>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
    </q-card-title>
    <q-card-separator/>
    <q-card-main>
      <q-list class="actions-container" no-border>
        <q-btn
          v-if="$props.onDeleteItem"
          flat
          size="lg"
          icon="delete"
          @click="$props.onDeleteItem"
        />
        <q-btn v-if="$props.onCopyItem" flat size="lg" icon="file_copy" @click="$props.onCopyItem"/>
        <q-btn
          v-if="$props.onMoveItem"
          flat
          size="lg"
          icon="exit_to_app"
          @click="$props.onMoveItem"
        />
      </q-list>
    </q-card-main>
  </q-card>
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
