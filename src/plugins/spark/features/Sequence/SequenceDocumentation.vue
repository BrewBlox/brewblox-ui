<script lang="ts">
import { instructions } from 'brewblox-proto/docs/Sequence.json';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SequenceDocumentation',
  setup() {
    return { instructions };
  },
});
</script>

<template>
  <q-scroll-area class="fit">
    <q-expansion-item
      label="Sequence Instructions"
      header-class="text-big"
      default-opened
    >
      <div class="q-px-lg q-pt-md">
        <p>
          For the complete reference guide, see the
          <a
            href="https://brewblox.com//dev/reference/sequence_instructions.html"
            target="_blank"
            style="color: white"
          >
            Sequence block guide.
          </a>
        </p>
        <p>
          Unlike other block data fields, <i>Sequence</i> instructions are not
          represented as JSON object, but as a line protocol. The basic syntax
          for instructions is:
        </p>
        <p>
          <code>OPCODE arg1=value, arg2=value ...</code>
        </p>
        <p>
          Any instruction will always have an opcode, and zero or more
          arguments. All arguments must always be present.
        </p>
        <p>
          Arguments use a comma-separated <code>key=value</code> syntax, and do
          not have to be listed in any particular order. There is no comma
          between the opcode and the first argument. <br />
          If an instruction has arguments, they are separated from the opcode
          with at least one space. Any number of spaces can be inserted next to
          the comma <code>,</code> and <code>=</code> separator characters.
          <br />
          Both instructions in the below example are equally valid.
        </p>
        <p>
          <code>OPCODE key1=value,key2=value</code> <br />
          <code>OPCODE key1 = value , key2 = value</code>
        </p>
        <p>
          Quantities are automatically identified, and converted where required.
          The output from the Spark service always returns quantities with the
          user-preferred units.<br />
          Abbreviated temperature units are used: <code>C</code> or
          <code>F</code> for absolute values, and <code>dC</code> or
          <code>dF</code> for relative values.
        </p>
        <p>
          Time duration values (such as found in <code>WAIT_DURATION</code>) can
          be expressed either in integer seconds, or as duration string (eg.
          <code>1d6h10m5s</code>).
        </p>
        <p>
          If any argument is a string that contains trailing or leading spaces,
          it must be quoted using single quotes. For all other arguments, quotes
          are allowed but optional.
        </p>
        <p>Example instructions:</p>
        <p>
          <code>SET_SETPOINT target=BK Setpoint, setting=65C</code><br />
          <code>ENABLE target='BK Setpoint'</code><br />
          <code>WAIT_SETPOINT target='BK Setpoint', precision=1dC</code><br />
          <code>START_PROFILE target='BK Profile '</code><br />
          <code>ENABLE target='BK Profile'</code><br />
          <code>WAIT_PROFILE target='BK Profile '</code><br />
        </p>
      </div>
    </q-expansion-item>

    <q-expansion-item
      v-for="instruction in instructions"
      :key="instruction.name"
      :label="instruction.name"
      header-class="text-secondary"
    >
      <div class="q-px-lg q-pt-sm">
        <p v-html="instruction.desc" />

        <b>Arguments</b>
        <ul v-if="instruction.arguments.length">
          <li
            v-for="arg in instruction.arguments"
            :key="`${instruction.name}-arg-${arg.name}`"
          >
            <code>{{ arg.name }}</code
            >: <span v-html="arg.desc" /> (<i>{{ arg.type }}</i
            >)
          </li>
        </ul>
        <p
          v-else
          class="fade-5"
        >
          N/A
        </p>

        <b>Errors</b>
        <ul v-if="instruction.errors.length">
          <li
            v-for="err in instruction.errors"
            :key="`${instruction.name}-error-${err}`"
          >
            <code>{{ err }}</code>
          </li>
        </ul>
        <p
          v-else
          class="fade-5"
        >
          N/A
        </p>

        <b>Example</b>
        <div class="q-py-sm">
          <div
            v-for="(ex, idx) in instruction.example"
            :key="`${instruction.name}-example-${idx}`"
            class="q-mb-xs"
          >
            <code>
              {{ ex }}
            </code>
            <br />
          </div>
        </div>
      </div>
    </q-expansion-item>
  </q-scroll-area>
</template>

<style
  scoped
  lang="sass"
>
code
  background-color: grey
  padding: 5px
</style>
