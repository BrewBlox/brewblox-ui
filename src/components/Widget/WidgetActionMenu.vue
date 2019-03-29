<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';


@Component({
  props: {
    itemId: {
      type: String,
      required: true,
    },
    onCopy: {
      type: Function,
      required: false,
    },
    onMove: {
      type: Function,
      required: false,
    },
    onDelete: {
      type: Function,
      required: false,
    },
  },
})
export default class WidgetActionMenu extends Vue { }
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar>{{ $props.itemId }} Menu</FormToolbar>

    <q-card-section>
      <q-item dark>
        <q-item-section v-if="$props.onCopy">
          <q-btn v-close-popup flat size="lg" icon="file_copy" label="Copy" @click="$props.onCopy"/>
        </q-item-section>
        <q-item-section v-if="$props.onMove">
          <q-btn
            v-close-popup
            flat
            size="lg"
            icon="exit_to_app"
            label="Move"
            @click="$props.onMove"
          />
        </q-item-section>
        <q-item-section v-if="$props.onDelete">
          <q-btn
            v-close-popup
            flat
            size="lg"
            icon="delete"
            label="Delete"
            @click="$props.onDelete"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
