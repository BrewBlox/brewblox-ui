<script lang="ts">
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/Widget/CrudComponent';

import { SessionNote, SessionNotesConfig } from './types';


@Component
export default class SessionNotesFull extends CrudComponent<SessionNotesConfig> {

  get notes(): SessionNote[] {
    return this.widget.config.notes;
  }

  get typeOpts(): SelectOption[] {
    return [
      { label: 'Text', value: 'text' },
      { label: 'Date', value: 'date' },
    ];
  }
}
</script>


<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />
    <slot name="graph" />

    <q-card-section>
      <q-list dark>
        <q-item
          v-for="note in notes"
          :key="note.id"
          dark
        >
          <q-item-section>
            <InputField :value="note.title" title="Title" />
          </q-item-section>
          <q-item-section class="col-auto">
            <q-btn-toggle outline :value="note.type" :options="typeOpts" />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-space />
          <q-item-section class="col-auto">
            <q-btn outline round icon="add" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>
