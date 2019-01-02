<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { ActuatorDS2413Block } from './state';

@Component
export default class ActuatorDS2413Widget extends BlockWidget {
  get block(): ActuatorDS2413Block {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get subtitles() {
    return [
      'State',
      'Constraints',
      'Graph',
    ];
  }

  get renamedTargets() {
    return {
      state: 'State',
    };
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <ActuatorDS2413Form
        v-if="modalOpen"
        :field="block"
        :change="saveBlock"
        :change-id="changeBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <InputPopupEdit
        :field="widgetId"
        :change="v => widgetId = v"
        class="ellipsis"
        label="Widget ID"
        display="span"
      />
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-carousel v-model="slideIndex" quick-nav class="col">
      <!-- State -->
      <q-carousel-slide class="unpadded">
        <div :class="['widget-body', orientationClass]">
          <q-card-main class="column col">
            <q-field class="col" label="Actuator">
              <LinkPopupEdit
                :field="block.data.hwDevice"
                :service-id="serviceId"
                :change="callAndSaveBlock(v => block.data.hwDevice = v)"
                label="Actuator"
              />
            </q-field>
            <q-field class="col" label="State">
              <ActuatorState
                :field="block.data.state"
                :change="callAndSaveBlock(v => block.data.state = v)"
              />
            </q-field>
          </q-card-main>
        </div>
      </q-carousel-slide>
      <!-- Constraints -->
      <q-carousel-slide class="unpadded">
        <q-card-main class="column col">
          <q-field class="col" label="Constraints" orientation="vertical">
            <DigitalConstraints
              :service-id="serviceId"
              :field="block.data.constrainedBy"
              :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
              readonly
            />
          </q-field>
        </q-card-main>
      </q-carousel-slide>
      <!-- Graph -->
      <q-carousel-slide class="unpadded">
        <BlockGraph :id="widgetId" :config="graphCfg" :change="v => graphCfg = v"/>
      </q-carousel-slide>
      <q-btn
        slot-scope="props"
        slot="quick-nav"
        :icon="navIcon(props.slide)"
        :label="navTitle(props.slide)"
        :class="{inactive: !props.current}"
        color="white"
        flat
        dense
        @click="props.goToSlide()"
      />
    </q-carousel>
  </q-card>
</template>

<style scoped>
</style>

