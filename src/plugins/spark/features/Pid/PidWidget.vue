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
  subtitle = 'loading';

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
    return this.$props.cols >= 4;
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

  onSlideChange(idx: number) {
    const subtitles = [
      'State',
      'Input/Output',
      'Settings',
    ];

    this.subtitle = subtitles[idx];
  }

  mounted() {
    this.onSlideChange(0);
  }
}
</script>

<template>
  <div>
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

    <q-card dark class="full-height column">
      <q-card-title class="title-bar">
        {{ $props.id }}
        <span class="vertical-middle on-left" slot="right">{{ this.subtitle }}</span>
        <q-btn
          slot="right"
          flat
          dense
          round
          @click="() => this.modalOpen = true"
          icon="settings"
        />
        <q-btn
          slot="right"
          flat
          round
          dense
          @click="refreshBlock"
          icon="refresh"
        />
      </q-card-title>

      <q-card-separator/>

      <q-alert type="info" color="info" v-if="!!this.block.disabled">
        This PID is disabled
      </q-alert>
      <q-alert type="warning" color="warn" v-if="!this.block.disabled && !this.block.active">
        This PID is inactive
      </q-alert>

      <q-carousel quick-nav class="col" @input="onSlideChange">
        <!-- Overview -->
        <q-carousel-slide>
          <div :class="['widget-body', horizontal ? 'row' : 'column']">
          <q-card-main class="column col">
            <q-field
              dark
              class="col"
              label="Error"
            >
              <big>{{ block.data.error | unit }}</big>
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
        </q-carousel-slide>
        <q-carousel-slide>
          <div :class="horizontal ? 'row' : 'column'">
            <q-card-main class="column col">
              <q-item class="full-width text-center">Input</q-item>
              <q-field
                dark
                class="col"
                label="Target"
              >
                <big>{{ block.data.inputValid ? block.data.inputSetting : '-' | unit }}</big>
              </q-field>
              <q-field
                dark
                class="col"
                label="Actual"
              >
                <big>{{ block.data.inputValid ? block.data.inputValue : '-' | unit }}</big>
              </q-field>
            </q-card-main>

            <q-card-main class="column col">
              <q-item class="full-width text-center">Output</q-item>
              <q-field
                dark
                class="col"
                label="Target"
              >
                <big>{{ block.data.outputValid ? block.data.outputSetting : '-' | unit }}</big>
              </q-field>
              <q-field
                dark
                class="col"
                label="Actual"
              >
                <big>{{ block.data.outputValid ? block.data.outputValue : '-' | unit }}</big>
              </q-field>
            </q-card-main>
          </div>
        </q-carousel-slide>
        <q-carousel-slide>
          <div :class="horizontal ? 'row' : 'column'">
            <q-card-main class="column col">
              <q-field
                dark
                class="col"
                label="Kp"
              >
              <UnitPopupEdit
                label="Kp"
                :field="block.data.kp"
                :change="v => { block.data.kp = v; this.saveBlock(); }"
              />
              </q-field>
              <q-field
                dark
                class="col"
                label="Ti"
              >
               <UnitPopupEdit
                label="Ti"
                :field="block.data.ti"
                :change="v => { block.data.ti = v; this.saveBlock(); }"
              />
              </q-field>
              <q-field
                dark
                class="col"
                label="Td"
              >
                <UnitPopupEdit
                  label="Td"
                  :field="block.data.td"
                  :change="v => { block.data.td = v; this.saveBlock(); }"
                />
              </q-field>
            </q-card-main>

            <q-card-main class="column col">
              <q-field
                dark
                class="col"
                label="Filter"
              >
                <big class="editable">{{ filterName }}</big>
                <q-popup-edit
                  buttons
                  persistent
                  title="Edit filter"
                  v-model="placeholder"
                  @show="() => startEdit(block.data, 'filter')"
                  @save="() => endEdit(block.data, 'filter')"
                >
                  <q-select
                    v-model="placeholder"
                    :options="filterOpts"
                  />
                </q-popup-edit>
              </q-field>
              <q-field
                dark
                class="col"
                label="Filter threshold"
              >
                <big class="editable">{{ block.data.filterThreshold | unit }}</big>
                <q-popup-edit
                  buttons
                  persistent
                  title="Edit filter threshold"
                  v-model="placeholder"
                  @show="() => startEdit(block.data.filterThreshold, 'value')"
                  @save="() => endEdit(block.data.filterThreshold, 'value')"
                >
                  <q-input
                    type="number"
                    :suffix="block.data.filterThreshold.unitNotation"
                    v-model="placeholder"
                  />
                </q-popup-edit>
              </q-field>
            </q-card-main>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </q-card>
  </div>
</template>

<style scoped>
.q-carousel-slide {
  padding: 0px;
}

.q-card-container {
  padding: 0px;
}

.title-bar {
  padding: 5px 10px;
}

.q-card-main {
  padding: 10px;
}
</style>
