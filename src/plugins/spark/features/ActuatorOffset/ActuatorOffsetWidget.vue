<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { ActuatorOffsetBlock } from './state';
import { getById } from './getters';
import { GraphConfig } from '@/components/Graph/state';

@Component
export default class ActuatorOffsetWidget extends BlockWidget {
  get block(): ActuatorOffsetBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get settingOrValue() {
    return ['Setting', 'Value'][this.block.data.referenceSettingOrValue];
  }

  get subtitles() {
    return [
      'State',
      'Constraints',
      'Graph',
    ];
  }

  get warnings() {
    const warn = [];
    if (!this.block.data.targetValid) {
      warn.push('Target invalid');
    }
    if (!this.block.data.referenceValid) {
      warn.push('Reference invalid');
    }
    return warn.join(', ');
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
            blockFmt('setting'),
            blockFmt('value'),
          ],
        },
      ],
      renames: {
        [serviceFmt('setting')]: 'Setting',
        [serviceFmt('value')]: 'Value',
      },
    };
  }

  set graphCfg(config: GraphConfig) {
    this.queryParams = { ...config.params };
  }
}
</script>

<template>
  <div>
    <q-modal v-model="modalOpen">
      <ActuatorOffsetForm
        v-if="modalOpen"
        :field="block"
        :change="saveBlock"
      />
    </q-modal>

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

      <q-alert type="warning" color="warn" v-if="warnings">
        {{ warnings }}
      </q-alert>

      <q-carousel
        quick-nav
        class="col"
        v-model="slideIndex"
      >
        <!-- State -->
        <q-carousel-slide class="unpadded">
          <div :class="['widget-body', orientationClass]">
            <q-card-main class="column col">
              <q-field
                class="col"
                label="Target"
              >
                <LinkPopupEdit
                  label="Target"
                  :field="block.data.targetId"
                  :serviceId="serviceId"
                  :change="callAndSaveBlock(v => block.data.targetId = v)"
                />
              </q-field>
              <q-field
                class="col"
                label="Reference"
              >
                <LinkPopupEdit
                  label="Reference"
                  :field="block.data.referenceId"
                  :serviceId="serviceId"
                  :change="callAndSaveBlock(v => block.data.referenceId = v)"
                />
              </q-field>
              <q-field
                class="col"
                label="Setting"
              >
                <big>{{ block.data.setting | round }}</big>
              </q-field>
              <q-field
                class="col"
                label="Value"
              >
                <big>{{ block.data.value | round }}</big>
              </q-field>
              <q-field
                class="col"
                label="Setting or value"
              >
                <big>{{ settingOrValue }}</big>
              </q-field>
            </q-card-main>
          </div>
        </q-carousel-slide>
        <!-- Constraints -->
        <q-carousel-slide class="unpadded">
          <div :class="['widget-body', orientationClass]">
            <q-card-main class="column col">
              <q-field
                class="col"
                label="Constraints"
                orientation="vertical"
              >
                <ReadonlyConstraints
                  :serviceId="serviceId"
                  v-model="block.data.constrainedBy"
                />
              </q-field>
            </q-card-main>
          </div>
        </q-carousel-slide>
        <!-- Graph -->
        <q-carousel-slide class="unpadded">
          <BlockGraph :id="widgetId" :config="graphCfg" :change="v => graphCfg = v"/>
        </q-carousel-slide>

      </q-carousel>
    </q-card>
  </div>
</template>

<style scoped>
</style>

