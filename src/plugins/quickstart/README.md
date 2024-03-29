# Quickstart wizards

Quickstart wizards are a specific subsection of wizards.
They have an arbitrary number of steps, and generate an arbitrary combination of services, dashboards, widgets, and blocks.

## Api

A Quickstart feature registers a list of Vue components as tasks.
Tasks will be executed in order, and are expected to emit `back` and `next` events to control flow.

Storage is done using two synchronized properties: `config`, and `actions`.
New Quickstart runs will be initialized with empty objects for both, and are expected to independently fill and use them.

The property and emits definitions can be imported from the [use-task](./composables/use-task.ts) composable.

An example Task component (using `script setup`):

```ts
import { UseTaskEmits, UseTaskProps } from '../composables';

interface ExampleConfig {
  name: string;
  temperature: number;
}

const props = defineProps<UseTaskProps<ExampleConfig>>();

const emit = defineEmits<UseTaskEmits<ExampleConfig>>();

const temperature = computed<number>({
  get: () => props.config.temperature,
  set: (v) =>
    emit('update:config', {
      ...props.config,
      temperature: v,
    }),
});

function addAction(action: ExampleAction): void {
  emit('update:actions', [...props.actions, action]);
}
```

`config` and `actions` are shared across all tasks.
State is kept when any task after the first emits `back`.
State is discarded after a task emits `close`, or the first task emits `back`.

Emitting `back` will navigate the user to the previous task or wizard.
This means that if the first task emits `back`, the user will be returned to the Quickstart selection dialog.

Emitting `next` will navigate the user to the next task.
If the last task emits `next`, nothing will happen.

Emitting `close` will close the dialog entirely.
