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
  get block(): SetPointSimpleBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get setting() {
    return this.block.data.setting;
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
          <big>{{ setting.value }}</big> {{ setting.unitNotation }}
        </q-field>

      </q-card-main>
    </q-card>

  </div>
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
