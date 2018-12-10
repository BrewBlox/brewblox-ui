<script lang="ts">
import { Unit } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { isNullOrUndefined } from 'util';
import Component from 'vue-class-component';
import { getById } from './getters';
import { SetpointSimpleBlock } from './state';

@Component
export default class SetpointSimpleWidget extends BlockWidget {
  get block(): SetpointSimpleBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get subtitles() {
    return [
      'State',
    ];
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <SetpointSimpleForm
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
    <q-alert type="warning" color="warn" v-if="!this.block.data.valid">This Setpoint is invalid</q-alert>
    <q-carousel quick-nav class="col" v-model="slideIndex">
      <!-- State -->
      <q-carousel-slide class="unpadded">
        <div :class="['widget-body', orientationClass]">
          <q-card-main class="column col">
            <q-field class="col" label="Setpoint">
              <UnitPopupEdit
                label="Setpoint"
                :field="block.data.setting"
                :change="callAndSaveBlock(v => block.data.setting = v)"
              />
            </q-field>
            <q-field class="col" label="Valid">
              <q-toggle
                :value="block.data.valid"
                @input="v => { block.data.valid = v; saveBlock(); }"
              />
            </q-field>
          </q-card-main>
        </div>
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
