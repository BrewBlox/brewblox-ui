<template>
  <q-card class="WPid" inline>
    <q-card-title class="bigger">
      PID regelaar
    </q-card-title>
    <q-card-separator inline />
    <q-card-main>
      <div class='row'>
          <s-Field class = "col-4"/>
          <s-Field class = "col-4"/>
          <s-Field class = "col-4"/>
      </div>
        <div class='row'>
          <s-Field class = "col-4"/>
          <s-Field class = "col-4"/>
          <s-Field class = "col-4"/>
      </div>
    </q-card-main>
    <q-card-separator inline />
    <q-card-main>
      <s-Slider></s-Slider>
      <s-Slider></s-Slider>
      <s-Slider></s-Slider>
    </q-card-main>
  </q-card>
</template>

<script>
import SSlider from './SSlider.vue';
import SField from './SField.vue';
import {
  QCard,
  QCardTitle,
  QCardMain,
  QCardSeparator,
} from 'quasar';


export default {
  name: 'WPid',
  components: {
    QCard,
    QCardTitle,
    QCardMain,
    QCardSeparator,
    SSlider,
    SField,
  },
  props: {
  },
  data: () => ({
    name: 'heater1pid',
    input: {
      value: 20,
      setPoint: 21.0859,
    },
    output: {
      value: 45.6758,
    },
    settings: {
      Kp: 10,
      Ti: 600,
      Td: 60,
      inputFilter: 3,
      derivativeFilter: 4,
      enabled: true,
    },
    state: {
      inputError: -1.0781,
      p: 10.7813,
      i: 34.8164,
      d: 0.0781,
    }
  }),
  created() {
  },
  computed: {
  },
  methods: {
  },
  mounted() {
  },
  beforeDestroy() {
  },
};
</script>

<style lang="stylus">
.WPid {
  width: 500px;
  height: 500px;
}
</style>
