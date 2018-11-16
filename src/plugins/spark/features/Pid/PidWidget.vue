<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { saveBlock } from '@/plugins/spark/store/actions';
import { PidBlock } from './state';
import { getById, filters } from './getters';
import FormBase from '@/components/Widget/FormBase';
import { GraphConfig } from '@/components/Graph/state';
import { QueryParams } from '@/store/history/state';

@Component
export default class PidWidget extends BlockWidget {
  modalOpen: boolean = false;
  slideIndex: number = 0;

  get block(): PidBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: PidBlock) {
    this.saveBlock(block);
  }

  get queryParams(): QueryParams {
    return this.$props.config.queryParams || {
      approxPoints: 200,
      duration: '10m',
    };
  }

  set queryParams(queryParams: QueryParams) {
    this.$props.onConfigChange(this.$props.id, { ...this.$props.config, queryParams });
  }

  get graphCfg(): GraphConfig {
    const blockFmt = (val: string) => [this.blockId, val].join('/');
    const serviceFmt = (val: string) => [this.serviceId, this.blockId, val].join('/');

    return {
      // persisted in config
      params: this.queryParams,
      // constants
      layout: {},
      targets: [
        {
          measurement: this.serviceId,
          fields: [
            blockFmt(`kp[${this.block.data.kp.unit}]`),
            blockFmt(`ti[${this.block.data.ti.unit}]`),
            blockFmt(`td[${this.block.data.td.unit}]`),
          ],
        },
      ],
      renames: {
        [serviceFmt(`kp[${this.block.data.kp.unit}]`)]: 'Kp',
        [serviceFmt(`ti[${this.block.data.ti.unit}]`)]: 'Ti',
        [serviceFmt(`td[${this.block.data.td.unit}]`)]: 'Td',
      },
    };
  }

  set graphCfg(config: GraphConfig) {
    this.queryParams = { ...config.params };
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

  get subtitle() {
    const subtitles = [
      'State',
      'Input/Output',
      'Settings',
      'Graph',
    ];
    return subtitles[this.slideIndex] || '';
  }

  onClose() {
    this.modalOpen = false;
  }

  onSave() {
    this.formComponent.confirmChanges();
  }

  saved(func: Function) {
    return (v: any) => { func(v); this.saveBlock(); };
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
        <InputPopupEdit
          :field="widgetId"
          label="Widget ID"
          display="span"
          :change="v => widgetId = v"
        />
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

      <q-alert type="info" color="info" v-if="!this.block.data.enabled">
        This PID is disabled
      </q-alert>
      <q-alert type="warning" color="warn" v-if="this.block.data.enabled && !this.block.data.active">
        This PID is inactive
      </q-alert>

      <q-carousel
        quick-nav
        class="col"
        v-model="slideIndex"
      >
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
                :change="saved(v => block.data.kp = v)"
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
                :change="saved(v => block.data.ti = v)"
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
                  :change="saved(v => block.data.td = v)"
                />
              </q-field>
            </q-card-main>

            <q-card-main class="column col">
              <q-field
                dark
                class="col"
                label="Filter"
              >
                <SelectPopupEdit
                  label="Filter"
                  :field="block.data.filter"
                  :change="saved(v => block.data.filter = v)"
                  :options="filterOpts"
                />
              </q-field>
              <q-field
                dark
                class="col"
                label="Filter threshold"
              >
                <UnitPopupEdit
                  label="Filter threshold"
                  :field="block.data.filterThreshold"
                  :change="saved(v => block.data.filterThreshold = v)"
                />
              </q-field>
            </q-card-main>
          </div>
        </q-carousel-slide>
        <q-carousel-slide>
          <BlockGraph :id="$props.id" :config="graphCfg" :change="v => graphCfg = v"/>
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

.float-button {
  position: absolute;
  z-index: 2;
  left: 10px;
  top: 10px;
  display: flex;
}
</style>
