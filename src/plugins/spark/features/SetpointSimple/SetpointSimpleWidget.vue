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
    <q-alert v-if="block.data.value === null" type="warning" color="warn">This Setpoint is invalid</q-alert>
    <q-carousel v-model="slideIndex" quick-nav class="col widget-body">
      <!-- State -->
      <q-carousel-slide class="unpadded">
        <q-card-main class="col-12">
          <q-field :label="block.data.enabled ? 'Target' : 'Target when enabled'" label-width="6">
            <UnitPopupEdit
              :class="[block.data.setting.value === null ? 'darkened' : {}]"
              :field="block.data.setpoint"
              :change="callAndSaveBlock(v => block.data.setpoint = v)"
              label="Target"
            />
          </q-field>
          <q-field label="Enabled" label-width="6">
            <q-toggle
              :value="block.data.enabled"
              @input="v => { block.data.enabled = v; saveBlock() }"
            />
          </q-field>
        </q-card-main>
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

