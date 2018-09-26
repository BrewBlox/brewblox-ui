<script lang="ts">
import Component from 'vue-class-component';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { getById } from './getters';

@Component({
  components: {
    WidgetModal,
    WidgetToolbar,
  },
})
export default class InactiveObjectWidget extends BlockWidget {
  modalOpen: boolean = false;
}
</script>

<template>
  <div>

    <widget-modal
      :isOpen="modalOpen"
      :onClose="() => { this.modalOpen = false; }"
      :title="$props.id"
    >
      <inactive-object-form
        v-model="block"
      />
    </widget-modal>

    <widget-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
      :on-settings="() => { this.modalOpen = true; }"
    />

    <q-card class="widget-body">
      <q-item>
        <q-list-header>This block is not in any active profile</q-list-header>
      </q-item>
    </q-card>

  </div>
</template>

<style scoped>
</style>
