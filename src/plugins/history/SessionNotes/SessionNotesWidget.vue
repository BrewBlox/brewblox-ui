<script lang="ts">
import { uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';

import SessionNotesBasic from './SessionNotesBasic.vue';
import SessionNotesFull from './SessionNotesFull.vue';
import { SessionNotesConfig } from './types';


@Component({
  components: {
    Basic: SessionNotesBasic,
    Full: SessionNotesFull,
  },
})
export default class SessionNotesWidget extends WidgetBase<SessionNotesConfig> {
  gimmeNotes(): void {
    this.widget.config.notes.push(
      {
        id: uid(),
        title: 'Totally very important note',
        type: 'text',
        value: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
         Nam imperdiet nibh nulla, sit amet pellentesque felis imperdiet
         sed. Nam felis neque, lacinia ut orci eu, euismod aliquet erat.
         Fusce erat enim, sollicitudin non gravida sed, ullamcorper
         sollicitudin magna. Cras quis libero eget nibh dapibus
         eleifend nec vitae dolor. Sed eleifend dolor id turpis
         condimentum volutpat. Phasellus vitae euismod nunc, vel
         sodales neque. Nulla vestibulum, nibh at bibendum consectetur,
         libero augue pulvinar mi, vestibulum feugiat quam mauris sed elit.
         In accumsan interdum pretium. Aenean gravida varius turpis, nec
         viverra mi vestibulum ornare. `.replace(/\n         /gm, ' '),
      },
      {
        id: uid(),
        title: 'Totally very important date',
        type: 'date',
        value: new Date().toUTCString(),
      },
      {
        id: uid(),
        title: 'Empty note',
        type: 'text',
        value: null,
      }
    );
    this.saveConfig(this.widget.config);
  }

  clearNotes(): void {
    this.saveConfig({ ...this.widget.config, notes: [] });
  }
}
</script>

<template>
  <component
    :is="mode"
    :crud="crud"
    :class="cardClass"
  >
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem icon="add" label="gimme" @click="gimmeNotes" />
          <ActionItem icon="delete" label="gimme not" @click="clearNotes" />
        </template>
      </component>
    </template>
  </component>
</template>
