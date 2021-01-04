<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { startChangeServiceTitle, startRemoveService } from '@/helpers/services';
import { TiltService } from '@/plugins/tilt/types';
import { serviceStore } from '@/store/services';
import { systemStore } from '@/store/system';


@Component
export default class TiltActions extends Vue {
  funcs = {
    startChangeServiceTitle,
    startRemoveService,
  }

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get service(): TiltService {
    return serviceStore.serviceById(this.serviceId)!;
  }

  get serviceTitle(): string {
    return this.service?.title || `Tilt '${this.serviceId}'`;
  }

  get isHomePage(): boolean {
    return systemStore.config.homePage === `/service/${this.service?.id}`;
  }

  set isHomePage(v: boolean) {
    const homePage = v && this.service ? `/service/${this.service.id}` : null;
    systemStore.saveConfig({ homePage });
  }
}
</script>

<template>
  <ActionSubmenu :label="serviceTitle">
    <ToggleAction
      v-model="isHomePage"
      icon="home"
      :label="isHomePage ? 'Is home page' : 'Make home page'"
    />
    <ActionItem
      icon="edit"
      label="Rename service"
      @click="funcs.startChangeServiceTitle(service)"
    />
    <ActionItem
      icon="delete"
      label="Remove service from UI"
      @click="funcs.startRemoveService(service)"
    />
  </ActionSubmenu>
</template>
