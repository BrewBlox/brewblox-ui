<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { saveBlock } from '@/plugins/spark/store/actions';
import { PidBlock } from './state';
import { getById, filters } from './getters';

@Component
export default class PidWidget extends BlockWidget {
  get block(): PidBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: PidBlock) {
    this.saveBlock(block);
  }

  get filterName() {
    return filters[this.block.data.filter];
  }
}
</script>

<template>

  <widget-card
    :title="$props.id"
    :subTitle="$props.type"
    :onRefresh="refreshBlock"
    :additionalInfo="additionalInfo"
    form="PidForm"
    v-model="block"
  >

    <!-- Input/output -->

    <widget-field
      :label="`Input value (${block.data.inputId})`"
      :icon="block.data.inputValid ? 'link' : 'link_off'"
    >
      <big>{{ block.data.inputValue | unit }}</big>
    </widget-field>

    <widget-field
      label="Input setting"
      icon="settings"
    >
      <big>{{ block.data.inputSetting | unit }}</big>
    </widget-field>

    <widget-field
      :label="`Output value (${block.data.outputId})`"
      :icon="block.data.outputValid ? 'link' : 'link_off'"
    >
      <big>{{ block.data.outputValue | round }}</big>
    </widget-field>

    <widget-field
      label="Output setting"
      icon="settings"
    >
      <big>{{ block.data.outputSetting | round }}</big>
    </widget-field>

    <!-- Filter -->

    <widget-field
      label="Filter / treshold"
      icon=""
    >
      <big>{{ filterName }} / {{ block.data.filterThreshold | unit }}</big>
    </widget-field>

    <!-- Enabled / active -->

    <widget-field
      label="Enabled"
      icon=""
    >
      <big>{{ block.data.enabled }}</big>
    </widget-field>

    <widget-field
      label="Active"
      icon=""
    >
      <big>{{ block.data.active }}</big>
    </widget-field>

    <!-- kp / ti / td -->

    <widget-field
      label="Kp"
      icon=""
    >
      <big>{{ block.data.kp | unit }}</big>
    </widget-field>

    <widget-field
      label="Ti"
      icon=""
    >
      <big>{{ block.data.ti | unit }}</big>
    </widget-field>

    <widget-field
      label="Td"
      icon=""
    >
      <big>{{ block.data.td | unit }}</big>
    </widget-field>

    <!-- p / i / d -->

    <widget-field
      label="P"
      icon=""
    >
      <big>{{ block.data.p | round }}</big>
    </widget-field>

    <widget-field
      label="I"
      icon=""
    >
      <big>{{ block.data.i | round }}</big>
    </widget-field>

    <widget-field
      label="D"
      icon=""
    >
      <big>{{ block.data.d | round }}</big>
    </widget-field>

    <!-- error / integral / derivative -->

    <widget-field
      label="Error"
      icon=""
    >
      <big>{{ block.data.error | unit }}</big>
    </widget-field>

    <widget-field
      label="Integral"
      icon=""
    >
      <big>{{ block.data.integral | unit }}</big>
    </widget-field>

    <widget-field
      label="derivative"
      icon=""
    >
      <big>{{ block.data.derivative | unit }}</big>
    </widget-field>

  </widget-card>
</template>

<style scoped>
</style>
