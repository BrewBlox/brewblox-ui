<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { saveBlock } from '@/plugins/spark/store/actions';
import { SetpointSimpleBlock } from './state';
import { getById } from './getters';

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
  <div>
    <q-modal v-model="modalOpen">
      <SetpointSimpleForm v-if="modalOpen" :field="block" :change="saveBlock" />
    </q-modal>

    <q-card dark class="full-height column">
      <q-card-title class="title-bar">
        <InputPopupEdit class="ellipsis" :field="widgetId" label="Widget ID" display="span" :change="v => widgetId = v" />
        <span class="vertical-middle on-left" slot="right">{{ displayName }}</span>
        <q-btn flat round dense slot="right" @click="openModal" icon="settings" />
        <q-btn flat round dense slot="right" @click="refreshBlock" icon="refresh" />
      </q-card-title>
      <q-card-separator />

      <q-carousel quick-nav class="col" v-model="slideIndex">
        <!-- State -->
        <q-carousel-slide class="unpadded">
          <div :class="['widget-body', orientationClass]">
            <q-card-main class="column col">
              <q-field class="col" label="Setpoint">
                <UnitPopupEdit label="Setpoint" :field="block.data.setting" :change="callAndSaveBlock(v => block.data.setting = v)" />
              </q-field>
            </q-card-main>
          </div>
        </q-carousel-slide>

        <q-btn slot="quick-nav" slot-scope="props" color="white" flat dense :icon="navIcon(props.slide)" :label="navTitle(props.slide)" @click="props.goToSlide()" :class="{inactive: !props.current}" />

      </q-carousel>
    </q-card>
  </div>
</template>

<style scoped>
</style>
