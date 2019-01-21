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
      toggleColor: 'grey-8',
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
    this.$props.change(v);
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
