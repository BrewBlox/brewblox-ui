<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { ActuatorPinBlock } from './state';
import { getById, state } from './getters';
import { GraphConfig } from '@/components/Graph/state';

@Component
export default class ActuatorPinWidget extends BlockWidget {
  get block(): ActuatorPinBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get subtitles() {
    return [
      'State',
      'Constraints',
      'Graph',
    ];
  }

  get actuatorState() {
    return state[this.block.data.state];
  }

  get renamedTargets() {
    return {
      state: 'State',
    };
  }

  changeInvert(val: boolean) {
    this.block.data.invert = val;
    this.saveBlock();
  }
}
</script>

<template>
  <div>
    <q-modal v-model="modalOpen">
      <ActuatorPinForm
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
          flat round dense
          slot="right"
          @click="() => this.modalOpen = true"
          icon="settings"
        />
        <q-btn
          flat round dense
          slot="right"
          @click="refreshBlock"
          icon="refresh"
        />
      </q-card-title>
      <q-card-separator />

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
                label="State"
              >
                <big>{{ actuatorState }}</big>
              </q-field>
              <q-field
                class="col"
                label="Inverted"
              >
                <q-toggle
                  :value="block.data.invert"
                  @input="changeInvert"
                />
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

