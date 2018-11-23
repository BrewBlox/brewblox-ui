<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById, state } from './getters';
import { ActuatorPinBlock } from './state';

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

  get pending() {
    if (!this.block.data.constrainedBy) {
      return null;
    }
    const unconstrained = this.block.data.constrainedBy.unconstrained;
    if (this.block.data.state === unconstrained) {
      return null;
    }
    return state[unconstrained];
  }

  get actuatorState() {
    return state[this.block.data.state];
  }

  get boolState() {
    return this.actuatorState === 'Active';
  }

  set boolState(v: boolean) {
    this.block.data.state = v ? 1 : 0;
    this.saveBlock();
  }

  get renamedTargets() {
    return {
      state: 'State',
    };
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
        :changeId="changeBlockId"
      />
    </q-modal>
    <q-card dark class="full-height column">
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
              <q-field class="col" label="State">
                <q-toggle
                  v-if="block.data.state <= 1"
                  :value="boolState"
                  @input="v => { boolState = v; }"
                />
                <div v-else>
                  <q-btn
                    class="reset-button"
                    dense
                    no-caps
                    flat
                    color="warning"
                    @click="boolState = false"
                    label="Unknown state!"
                  >
                    <q-tooltip>
                      Click to try to set to
                      <i>inactive</i>
                    </q-tooltip>
                  </q-btn>
                </div>
              </q-field>
              <q-field v-if="pending !== null" class="col" label="Pending">
                <span>{{pending}}</span>
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
  </div>
</template>

<style scoped>
</style>

