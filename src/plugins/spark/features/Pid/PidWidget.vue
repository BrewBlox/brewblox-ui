<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { saveBlock } from '@/plugins/spark/store/actions';
import { PidBlock } from './state';
import { getById, filters } from './getters';
import { Watch } from 'vue-property-decorator';
import FormBase from '@/components/Widget/FormBase';

@Component({
  props: {
    cols: {
      type: Number,
      required: true,
    },
  },
})
export default class PidWidget extends BlockWidget {
  modalOpen: boolean = false;

  get block(): PidBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: PidBlock) {
    this.saveBlock(block);
  }

  get filterName() {
    return filters[this.block.data.filter];
  }

  get filterOpts() {
    return filters.map((filter, idx) => ({ label: filter, value: idx }));
  }

  get horizontal() {
    return this.$props.cols > 4;
  }

  get formComponent() {
    return this.$refs.form as FormBase;
  }

  onClose() {
    this.modalOpen = false;
  }

  onSave() {
    this.formComponent.confirmChanges();
  }
}
</script>

<template>
  <q-carousel
    quick-nav
  >

    <WidgetModal
      :isOpen="modalOpen"
      :onClose="onClose"
      :onSave="onSave"
      :title="$props.id"
    >
      <PidForm
        ref="form"
        v-model="block"
      />
    </WidgetModal>

    <!-- Overview -->
    <q-carousel-slide class="no-padding">
      <q-card dark>

        <q-card-title>
          {{ $props.id }}
          <span slot="subtitle">{{ $props.type }}</span>
          <q-btn
            slot="right"
            flat
            round
            @click="() => this.modalOpen = true"
            icon="settings"
          />
          <q-btn
            slot="right"
            flat
            round
            @click="refreshBlock"
            icon="refresh"
          />
        </q-card-title>
        <q-card-separator/>

        <div :class="horizontal ? 'row' : 'column'">

          <q-card-main class="column col">
            <q-field
              dark
              class="col"
              label="Error"
            >
              <big>
                {{ block.data.error | unit }}
              </big>
            </q-field>
            <q-field
              dark
              class="col"
              label="Integral"
            >
              <big>{{ block.data.integral | unit }}</big>
            </q-field>
            <q-field
              dark
              class="col"
              label="Derivative"
            >
              <big>{{ block.data.derivative | unit }}</big>
            </q-field>
          </q-card-main>

          <q-card-main class="column col">
            <q-field
              dark
              class="col"
              label="P"
            >
              <big>{{ block.data.p | round }}</big>
            </q-field>
            <q-field
              dark
              class="col"
              label="I"
            >
              <big>{{ block.data.i | round }}</big>
            </q-field>
            <q-field
              dark
              class="col"
              label="D"
            >
              <big>{{ block.data.d | round }}</big>
            </q-field>

          </q-card-main>

        </div>

      </q-card>
    </q-carousel-slide>

    <!-- Settings -->
    <q-carousel-slide>
      <q-card dark>

        <q-card-title>
          {{ $props.id }}
          <span slot="subtitle">Settings</span>
        </q-card-title>
        <q-card-separator />

        <div :class="horizontal ? 'row' : 'column'">

          <q-card-main class="column col">
            <q-field
              dark
              class="col"
              label="Kp"
            >
              <big>{{ block.data.kp | unit }}</big>
              <q-popup-edit
                v-model="block.data.kp"
                title="Edit Kp"
                buttons
              >
                <q-input
                  type="number"
                  :suffix="block.data.kp.unitNotation"
                  v-model="block.data.kp.value"
                />
              </q-popup-edit>
            </q-field>
            <q-field
              dark
              class="col"
              label="Ti"
            >
              <big>{{ block.data.ti | unit }}</big>
              <q-popup-edit
                v-model="block.data.ti"
                title="Edit Ti"
                buttons
              >
                <q-input
                  type="number"
                  :suffix="block.data.ti.unitNotation"
                  v-model="block.data.ti.value"
                />
              </q-popup-edit>
            </q-field>
            <q-field
              dark
              class="col"
              label="Td"
            >
              <big>{{ block.data.td | unit }}</big>
              <q-popup-edit
                v-model="block.data.td"
                title="Edit Td"
                buttons
              >
                <q-input
                  type="number"
                  :suffix="block.data.td.unitNotation"
                  v-model="block.data.td.value"
                />
              </q-popup-edit>
            </q-field>
          </q-card-main>

          <q-card-main class="column col">
            <q-field
              dark
              class="col"
              label="Filter"
            >
              <big>{{ block.data.filter | round }}</big>
              <q-popup-edit
                v-model="block.data.filter"
                title="Edit filter"
                buttons
              >
                <q-input
                  type="number"
                  v-model="block.data.filter"
                />
              </q-popup-edit>
            </q-field>
            <q-field
              dark
              class="col"
              label="Filter threshold"
            >
              <big>{{ block.data.filterThreshold | unit }}</big>
              <q-popup-edit
                v-model="block.data.filterThreshold"
                title="Edit filter threshold"
                buttons
              >
                <q-input
                  type="number"
                  :suffix="block.data.filterThreshold.unitNotation"
                  v-model="block.data.filterThreshold.value"
                />
              </q-popup-edit>
            </q-field>
          </q-card-main>

        </div>

      </q-card>
    </q-carousel-slide>

    <!-- Input / output -->
    <q-carousel-slide>
      <q-card dark>

        <q-card-title>
          {{ $props.id }}
          <span slot="subtitle">Input / Output</span>
        </q-card-title>
        <q-card-separator />

        <div :class="horizontal ? 'row' : 'column'">

          <q-card-main class="column col">
            <q-field
              dark
              class="col"
              label="PID enabled"
            >
              <q-toggle v-model="block.data.enabled" />
            </q-field>
            <q-field
              dark
              class="col"
              label="PID active"
            >
              <q-toggle disabled :value="block.data.active" />
            </q-field>
          </q-card-main>

          <q-card-main class="column col">
            <q-field
              dark
              class="col"
              label="Input valid"
            >
              <q-toggle disabled :value="block.data.inputValid" />
            </q-field>
            <q-field
              dark
              class="col"
              label="Input setting"
            >
              <big>{{ block.data.inputSetting | unit }}</big>
            </q-field>
            <q-field
              dark
              class="col"
              label="Input value"
            >
              <big>{{ block.data.inputValue | unit }}</big>
            </q-field>
          </q-card-main>

          <q-card-main class="column col">
            <q-field
              dark
              class="col"
              label="Output valid"
            >
              <q-toggle disabled :value="block.data.outputValid" />
            </q-field>
            <q-field
              dark
              class="col"
              label="Output setting"
            >
              <big>{{ block.data.outputSetting | round }}</big>
            </q-field>
            <q-field
              dark
              class="col"
              label="Output value"
            >
              <big>{{ block.data.outputValue | round }}</big>
            </q-field>
          </q-card-main>

        </div>

      </q-card>
    </q-carousel-slide>

  </q-carousel>
</template>

<style scoped>
</style>
