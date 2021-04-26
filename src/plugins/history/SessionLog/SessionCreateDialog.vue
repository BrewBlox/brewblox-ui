<script lang="ts">
import { nanoid } from 'nanoid';
import { computed, defineComponent, PropType, ref, watch } from 'vue';

import { useDialog } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { deepCopy } from '@/utils/functional';

import { emptyGraphConfig } from '../getters';
import { historyStore } from '../store';
import { LoggedSession, SessionGraphNote, SessionNote } from '../types';
import SessionSelectField from './SessionSelectField.vue';

export default defineComponent({
  name: 'SessionCreateDialog',
  components: {
    SessionSelectField,
  },
  props: {
    ...useDialog.props,
    widgetTags: {
      type: Array as PropType<string[]>,
      required: true,
    },
    preselected: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  emits: [
    ...useDialog.emits,
  ],
  setup(props) {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
    } = useDialog.setup();

    const sessionTitle = ref<string>('New Session');
    const tags = ref<string[]>([]);
    const customTags = ref<boolean>(false);
    const example: LoggedSession = {
      id: nanoid(),
      title: 'Example session',
      date: new Date().getTime(),
      tags: [...props.widgetTags],
      notes: [
        {
          id: nanoid(),
          title: 'Example note',
          type: 'Text',
          value: '',
          col: 12,
        },
        {
          id: nanoid(),
          title: 'Subprocess graph',
          type: 'Graph',
          start: null,
          end: null,
          config: emptyGraphConfig(),
          col: 12,
        },
      ],
    };

    const source = ref<LoggedSession>(
      props.preselected
        ? historyStore.sessionById(props.preselected)!
        : example,
    );

    watch(
      () => source.value,
      (newV) => {
        if (!customTags.value) {
          resetTags(newV);
        }
      },
    );

    const sessions = computed<LoggedSession[]>(
      () => [example, ...historyStore.sessions],
    );

    const knownTags = computed<string[]>(
      () => historyStore.sessionTags,
    );

    function saveTags(values: string[]): void {
      customTags.value = true;
      tags.value = [...values];
    }

    function resetTags(src: LoggedSession | null = source.value): void {
      customTags.value = true;
      tags.value = [
        ...props.widgetTags,
        ...src?.tags?.filter(t => !t.startsWith('on:')) ?? [],
      ];
    }

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: sessionTitle.value,
        },
      })
        .onOk(v => sessionTitle.value = v);
    }

    function sourceNotes(): SessionNote[] {
      if (source.value === null) {
        return [];
      }
      return source.value.notes
        .map(note => {
          const copy = deepCopy(note);
          copy.id = nanoid();
          if (note.type === 'Text') {
            return { ...copy, value: '' };
          }
          if (note.type === 'Graph') {
            (copy as SessionGraphNote).config.layout.annotations = [];
            return { ...copy, start: null, end: null };
          }
          return copy;
        });
    }

    async function save(): Promise<void> {
      const id = nanoid();
      const session: LoggedSession = {
        id,
        title: sessionTitle.value,
        date: new Date().getTime(),
        notes: sourceNotes(),
        tags: tags.value,
      };
      await historyStore.createSession(session);
      onDialogOK(session);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      sessionTitle,
      tags,
      customTags,
      source,
      sessions,
      knownTags,
      saveTags,
      resetTags,
      showKeyboard,
      save,
    };
  },
});
// @Component({
//   components: {
//     SessionSelectField,
//   },
// })
// export default class SessionCreateDialog extends DialogBase {
//   sessionTitle = 'New Session'
//   tags: string[] = [];
//   customTags = false;
//   source: LoggedSession | null = null;
//   example: LoggedSession = {
//     id: nanoid(),
//     title: 'Example session',
//     date: new Date().getTime(),
//     notes: [
//       {
//         id: nanoid(),
//         title: 'Example note',
//         type: 'Text',
//         value: '',
//         col: 12,
//       },
//       {
//         id: nanoid(),
//         title: 'Subprocess graph',
//         type: 'Graph',
//         start: null,
//         end: null,
//         config: emptyGraphConfig(),
//         col: 12,
//       },
//     ],
//     tags: [],
//   }

//   @Prop({ type: String, required: false })
//   public readonly preselected!: string | null;

//   @Prop({ type: Array, required: true })
//   public readonly widgetTags!: string[];

//   @Watch('source', { immediate: true })
//   watchSource(newSource): void {
//     if (!this.customTags) {
//       this.resetTags(newSource);
//     }
//   }

//   created(): void {
//     this.source = this.preselected
//       ? historyStore.sessionById(this.preselected)
//       : this.example;
//     this.example.tags = [...this.widgetTags];
//   }

//   get sessions(): LoggedSession[] {
//     return [this.example, ...historyStore.sessions];
//   }

//   get knownTags(): string[] {
//     return historyStore.sessionTags;
//   }

//   saveTags(tags: string[]): void {
//     this.customTags = true;
//     this.tags = tags;
//   }

//   resetTags(source: LoggedSession | null = this.source): void {
//     this.customTags = false;
//     this.tags = [
//       ...this.widgetTags,
//       ...source?.tags?.filter(t => !t.startsWith('on:')) ?? [],
//     ];
//   }

//   showKeyboard(): void {
//     createDialog({
//       component: 'KeyboardDialog',
//       value: this.sessionTitle,
//     })
//       .onOk(v => this.sessionTitle = v);
//   }

//   sourceNotes(): SessionNote[] {
//     if (this.source === null) {
//       return [];
//     }
//     return this.source.notes
//       .map(note => {
//         const copy = deepCopy(note);
//         copy.id = nanoid();
//         if (note.type === 'Text') {
//           return { ...copy, value: '' };
//         }
//         if (note.type === 'Graph') {
//           (copy as SessionGraphNote).config.layout.annotations = [];
//           return { ...copy, start: null, end: null };
//         }
//         return copy;
//       });
//   }

//   async save(): Promise<void> {
//     const id = nanoid();
//     const session: LoggedSession = {
//       id,
//       title: this.sessionTitle,
//       date: new Date().getTime(),
//       notes: this.sourceNotes(),
//       tags: this.tags,
//     };
//     await historyStore.createSession(session);
//     onDialogOK(session);
//   }
// }
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard :title="title">
      <q-input
        v-model="sessionTitle"
        label="Session name"
        autofocus
        item-aligned
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>
      <SessionSelectField
        v-model="source"
        :sessions="sessions"
        label="Use same fields as:"
      />
      <TagSelectField
        :model-value="tags"
        :existing="knownTags"
        class="tag-select"
        @update:model-value="saveTags"
      >
        <template v-if="customTags" #append>
          <q-btn
            icon="mdi-backup-restore"
            flat
            round
            dense
            class="self-center"
            @click="resetTags()"
          >
            <q-tooltip>
              Undo tag changes
            </q-tooltip>
          </q-btn>
        </template>
      </TagSelectField>
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>


<style>
.tag-select .q-field__append {
  align-self: flex-end;
}
</style>
