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
        :changeId="changeBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <InputPopupEdit
        class="ellipsis"
        :field="widgetId"
        label="Widget ID"
        display="span"
        :change="v => widgetId = v"
      />
      <span class="vertical-middle on-left" slot="right">{{ displayName }}</span>
      <q-btn flat round dense slot="right" @click="openModal" icon="settings"/>
      <q-btn flat round dense slot="right" @click="refreshBlock" icon="refresh"/>
    </q-card-title>
    <q-card-separator/>
    <q-carousel quick-nav class="col" v-model="slideIndex">
      <!-- State -->
      <q-carousel-slide class="unpadded">
        <div :class="['widget-body', orientationClass]">
          <q-card-main class="column col">
            <q-field class="col" label="Actuator">
              <LinkPopupEdit
                label="Actuator"
                :field="block.data.hwDevice"
                :serviceId="serviceId"
                :change="callAndSaveBlock(v => block.data.hwDevice = v)"
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
              readonly
              :serviceId="serviceId"
              :field="block.data.constrainedBy"
              :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
            />
          </q-field>
        </q-card-main>
      </q-carousel-slide>
      <!-- Graph -->
      <q-carousel-slide class="unpadded">
        <BlockGraph :id="widgetId" :config="graphCfg" :change="v => graphCfg = v"/>
      </q-carousel-slide>
      <q-btn
        slot="quick-nav"
        slot-scope="props"
        color="white"
        flat
        dense
        :icon="navIcon(props.slide)"
        :label="navTitle(props.slide)"
        @click="props.goToSlide()"
        :class="{inactive: !props.current}"
      />
    </q-carousel>
  </q-card>
</template>

<style scoped>
</style>

