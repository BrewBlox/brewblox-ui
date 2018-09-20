<script lang="ts">
import Component from 'vue-class-component';

import { saveBlock } from '@/services/Spark/store/actions';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import BlockWidget from '@/services/Spark/components/BlockWidget';
import { SetPointSimpleBlock } from './state';
import { getById } from './getters';

@Component({
  components: {
    WidgetToolbar,
  },
})
export default class OneWireTempSensor extends BlockWidget {
  inputMapping = {
    setting: { path: 'block.data.setting.value', default: 0 },
  };

  get block(): SetPointSimpleBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }
}
</script>

<template>
  <div>

    <widget-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
    />

    <q-card>
      <q-card-main class="row">

        <q-field
          dark
          label="Setting"
          icon="devices"
          orientation="vertical"
        >
          <big>{{ inputs.setting }}</big> {{ block.data.setting.unitNotation }}
        </q-field>

      </q-card-main>
    </q-card>

  </div>
</template>

<style scoped>
.q-card {
  display: flex;
}

.q-card-main {
  margin: auto;
}

/* .grid-items-2 {
  grid-template-columns: 1fr 1fr;
}

.grid-items-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.q-item-side {
  text-align: center;
  margin-left: 0;
}

.q-item-section {
  margin-left: 0;
}

.modal .q-list {
  border: 0;
} */
</style>
