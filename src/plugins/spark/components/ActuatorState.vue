<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';

@Component({
  props: {
    field: {
      required: true,
    },
    change: {
      type: Function,
      required: true,
    },
  },
})
export default class ActuatorState extends Vue {
  get commonOpts() {
    return {
      color: 'grey-9',
      toggleColor: 'primary',
      textColor: 'grey',
    };
  }

  get options() {
    return [
      {
        ...this.commonOpts,
        toggleTextColor: 'white',
        label: 'Off',
        value: 0,
      },
      {
        ...this.commonOpts,
        toggleTextColor: 'white',
        label: 'On',
        value: 1,
      },
    ];
  }

  get state() {
    return this.$props.field;
  }

  set state(v: number) {
    // always toggle, regardless of where the element was clicked
    if (this.state === 0 || !this.known) {
      this.$props.change(1);
    }
    if (this.state === 1) {
      this.$props.change(0);
    }
  }

  get known() {
    return !!this.options.find(opt => opt.value === this.state);
  }
}
</script>

<template>
  <div>
    <q-btn-toggle v-if="known" v-model="state" :options="options" dense/>
    <div v-else>
      <q-btn
        class="reset-button"
        dense
        no-caps
        flat
        color="warning"
        style="padding: 0px"
        @click="boolState = false"
      >Unknown state!
        <q-tooltip>
          Click to try to set to
          <i>inactive</i>
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<style>
</style>
