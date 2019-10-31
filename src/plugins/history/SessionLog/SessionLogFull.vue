<script lang="ts">
import { debounce, uid } from 'quasar';
import { Component } from 'vue-property-decorator';
import draggable from 'vuedraggable';

import CrudComponent from '@/components/Widget/CrudComponent';

import { Session, SessionLogConfig, SessionNote } from './types';


@Component({
  components: {
    draggable,
  },
})
export default class SessionLogFull extends CrudComponent<SessionLogConfig> {
  colSizes = [3, 4, 6, 8, 9, 12];

  get session(): Session | null {
    return this.widget.config.sessions
      .find(s => s.id === this.widget.config.currentSession) || null;
  }

  get notes(): SessionNote[] {
    return this.session ? this.session.notes : [];
  }

  set notes(notes: SessionNote[]) {
    if (this.session) {
      this.session.notes = notes;
      this.saveConfig();
    }
  }

  saveSessionTitle(title: string): void {
    if (this.session) {
      this.session.title = title;
      this.saveConfig();
    }
  }

  saveSessionDate(date: Date): void {
    if (this.session) {
      this.session.date = date.getTime();
      this.saveConfig();
    }
  }

  debouncedSave = debounce(this.saveConfig, 1000);

  saveSize(note: SessionNote, idx: number): void {
    const col = this.colSizes[idx];
    if (col && col !== note.col) {
      note.col = col;
      this.debouncedSave();
    }
  }

  saveTitle(note: SessionNote, title: string): void {
    if (title !== note.title) {
      note.title = title;
      this.saveConfig();
    }
  }

  clearNote(note: SessionNote): void {
    note.value = '';
    this.saveConfig();
  }

  removeNote(note: SessionNote): void {
    const idx = this.notes.findIndex(n => n.id === note.id);
    if (idx >= 0) {
      this.notes.splice(idx, 1);
      this.saveConfig();
    }
  }

  addNote(): void {
    // Todo: input dialog
    this.notes.push({
      id: uid(),
      title: 'New field',
      value: '',
      col: 12,
    });
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
        <q-item v-if="!!session" dark>
          <q-item-section class="col-auto">
            <InputField
              :value="session.title"
              title="Session title"
              label="Session title"
              @input="saveSessionTitle"
            />
          </q-item-section>
          <q-space />
          <q-item-section class="col-auto">
            <DatetimeField :value="session.date" title="Session date" @input="saveSessionDate" />
          </q-item-section>
        </q-item>
        <draggable v-model="notes" class="row q-gutter-xs">
          <div
            v-for="note in notes"
            :key="note.id"
            :class="[`col-${note.col}`, 'q-pa-xs', 'q-ma-none']"
          >
            <q-item
              style="border: 1px solid silver"
              dark
            >
              <q-item-section class="col-auto">
                <InputField
                  :value="note.title"
                  title="Note title"
                  label="title"
                  tag="div"
                  tag-class="ellipsis-3-lines"
                  :tag-props="{style: 'max-width: 100%'}"
                  @input="v => saveTitle(note, v)"
                />
              </q-item-section>
              <q-space />
              <q-item-section class="col-auto">
                <q-btn icon="mdi-dots-vertical" flat dense>
                  <q-menu>
                    <q-list dark bordered>
                      <ActionItem label="Clear content" icon="clear" @click="clearNote(note)" />
                      <ActionItem label="Remove note" icon="delete" @click="removeNote(note)" />
                      <q-item dark>
                        <q-item-section avatar>
                          <q-icon name="mdi-arrow-expand-horizontal" />
                        </q-item-section>
                        <q-item-section>
                          <q-slider
                            :min="0"
                            :max="colSizes.length-1"
                            :value="colSizes.indexOf(note.col)"
                            dark
                            snap
                            @input="v => saveSize(note, v)"
                          />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-item-section>
            </q-item>
          </div>
        </draggable>
        <q-item dark>
          <q-space />
          <q-item-section class="col-auto">
            <q-btn outline round icon="add" @click="addNote" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>
