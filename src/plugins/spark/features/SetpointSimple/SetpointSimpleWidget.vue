<script lang="ts">
import Component from 'vue-class-component';

import { saveBlock } from '@/plugins/spark/store/actions';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import WidgetField from '@/components/Widget/WidgetField.vue';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import { SetpointSimpleBlock } from './state';
import { getById } from './getters';

@Component({
  components: {
    WidgetField,
    WidgetToolbar,
    WidgetModal,
  },
})
export default class SetpointSimpleWidget extends BlockWidget {
  modalOpen: boolean = false;

  get block(): SetpointSimpleBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: SetpointSimpleBlock) {
    this.saveBlock(block);
  }

  get setting() {
    return this.block.data.setting;
  }
}
</script>

<template>
  <div class="widget-container">

    <widget-modal
      :isOpen="modalOpen"
      :onClose="() => { this.modalOpen = false; }"
      :title="$props.id"
    >
      <setpoint-simple-form
        v-model="block"
      />
    </widget-modal>

    <widget-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
      :on-settings="() => { this.modalOpen = true; }"
    />

    <q-scroll-area class="widget-body">
      <q-card>
        <q-card-main class="row">

          <widget-field
            label="Setting"
            icon="devices"
          >
            <big>{{ setting | unit }}</big>
          </widget-field>

        </q-card-main>
      </q-card>
    </q-scroll-area>

  </div>
</template>

<style scoped>
</style>
