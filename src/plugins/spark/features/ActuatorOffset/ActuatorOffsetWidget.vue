<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { ActuatorOffsetBlock } from './state';

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
    const warn: string[] = [];
    if (!this.block.data.targetValid) {
      warn.push('Target invalid');
    }
    if (!this.block.data.referenceValid) {
      warn.push('Reference invalid');
    }
    return warn.join(', ');
  }

  get renamedTargets() {
    return {
      setting: 'Setting',
      value: 'Value',
    };
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <ActuatorOffsetForm
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
    <q-alert type="warning" color="warn" v-if="warnings">{{ warnings }}</q-alert>
    <q-carousel quick-nav class="col" v-model="slideIndex">
      <!-- State -->
      <q-carousel-slide class="unpadded">
        <div :class="['widget-body', orientationClass]">
          <q-card-main class="column col">
            <q-field class="col" label="Target">
              <LinkPopupEdit
                label="Target"
                :field="block.data.targetId"
                :serviceId="serviceId"
                :change="callAndSaveBlock(v => block.data.targetId = v)"
              />
            </q-field>
            <q-field class="col" label="Reference">
              <LinkPopupEdit
                label="Reference"
                :field="block.data.referenceId"
                :serviceId="serviceId"
                :change="callAndSaveBlock(v => block.data.referenceId = v)"
              />
            </q-field>
            <q-field class="col" label="Setting">
              <big>{{ block.data.setting | round }}</big>
            </q-field>
            <q-field class="col" label="Value">
              <big>{{ block.data.value | round }}</big>
            </q-field>
            <q-field class="col" label="Setting or value">
              <big>{{ settingOrValue }}</big>
            </q-field>
          </q-card-main>
        </div>
      </q-carousel-slide>
      <!-- Constraints -->
      <q-carousel-slide class="unpadded">
        <q-card-main class="column col">
          <q-field class="col" label="Constraints" orientation="vertical">
            <AnalogConstraints
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

