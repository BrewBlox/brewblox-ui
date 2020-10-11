<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { SetpointProfileBlock } from '@/plugins/spark/types';

import ProfilePresetDialog from './ProfilePresetDialog.vue';


@Component({
  components: {
    ProfilePresetDialog,
  },
})
export default class ProfilePresetAction
  extends BlockCrudComponent<SetpointProfileBlock> {

  @Prop({ type: String, default: 'mdi-file' })
  readonly icon!: string;

  @Prop({ type: String, default: 'Load/Save profile' })
  readonly label!: string;

  async showDialog(): Promise<void> {
    createDialog({
      component: ProfilePresetDialog,
      value: this.block,
      parent: this,
      title: 'Load/Save Profile',
    });
  }
}
</script>

<template>
  <ActionItem v-bind="{...$attrs, ...$props}" @click="showDialog" />
</template>
