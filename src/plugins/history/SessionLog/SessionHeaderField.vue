<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';

import { LoggedSession } from '../types';
import SessionHeaderDialog from './SessionHeaderDialog.vue';


@Component({
  components: {

  },
})
export default class SessionHeaderField extends Vue {
  @Prop({ type: Object, required: true })
  public readonly session!: LoggedSession;

  save(session: LoggedSession = this.session): void {
    this.$emit('update:session', session);
  }

  get tags(): string[] {
    return this.session.tags ?? [];
  }

  showDialog(): void {
    createDialog({
      component: SessionHeaderDialog,
      parent: this,
      session: this.session,
      title: 'Edit session',
    })
      .onOk(this.save);
  }
}
</script>

<template>
  <div class="row text-grey-2 q-px-md items-baseline hoverable" @click="showDialog">
    <q-tooltip
      v-if="tags.length > 0"
      content-style="background: transparent"
      anchor="bottom right"
      self="top right"
    >
      <div class="row wrap q-gutter-xs" style="max-width: 350px">
        <q-badge
          v-for="tag in tags"
          :key="`tag--${tag}`"
          color="blue-grey-7"
        >
          <small>{{ tag }}</small>
        </q-badge>
      </div>
    </q-tooltip>
    <div class="col-auto text-italic text-bold" style="font-size: 120%">
      {{ session.title }}
    </div>
    <q-space />
    <div class="col-auto">
      {{ new Date(session.date).toLocaleString() }}
    </div>
  </div>
</template>
