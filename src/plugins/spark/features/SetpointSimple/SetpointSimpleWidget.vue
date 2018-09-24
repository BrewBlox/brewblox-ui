<script lang="ts">
import Component from 'vue-class-component';

import { saveBlock } from '@/plugins/spark/store/actions';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import { SetpointSimpleBlock } from './state';
import { getById } from './getters';

@Component({
  components: {
    WidgetToolbar,
    WidgetModal,
  },
})
export default class SetpointSimpleWidget extends BlockWidget {
  modalOpen: boolean = false;

  get block(): SetpointSimpleBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get setting() {
    return this.block.data.setting;
  }
}
</script>

<template>
  <q-scroll-area>

    <widget-modal
      :isOpen="modalOpen"
      :onClose="() => { this.modalOpen = false; }"
      :title="$props.id"
    >
      TODO
    </widget-modal>

    <widget-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
      :on-settings="() => { this.modalOpen = true; }"
    />

    <q-card>
      <q-card-main class="row">

        <q-field
          dark
          label="Setting"
          icon="devices"
          orientation="vertical"
        >
          <big>{{ setting | unit }}</big>
        </q-field>

      </q-card-main>
    </q-card>

  </q-scroll-area>
</template>

<style scoped>
.q-card {
  display: flex;
}

.q-field {
  margin-top: 2pt;
  margin-bottom: 10pt;
}
</style>
