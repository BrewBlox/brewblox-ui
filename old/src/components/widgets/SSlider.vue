<template>
  <div class="row">
    <q-btn class="col-2" color="primary" @click="clickMethod" wrap>
      val = {{val}}
    </q-btn>   
    <q-slider
    class="col-10"
    v-model="val"
    :min="0"
    :max="100"
    :step="2"
    labelc
    snap
    wrap
    />
  </div>
</template>

<script>
import {
  QSlider,
  QBtn,
  QField,
  QModal,
  QModalLayout,
  QToolbar,
  QIcon,
  Dialog,
  Toast,
} from 'quasar';

export default {
  name: 'SSlider',
  components: {
    QSlider,
    QBtn,
    QField,
    QModal,
    QModalLayout,
    QToolbar,
    QIcon,
  },
  data() {
    return {
      val: 10,
    };
  },
  methods: {
    clickMethod() {
      Dialog.create({
        title: 'settings',
        form: {
          value: {
            type: 'number',
            label: 'value',
            model: 'val',
          },
          min: {
            type: 'number',
            label: 'min',
            model: 10,
            min: 1,
            max: 100,
          },
          max: {
            type: 'number',
            label: 'max',
            model: 10,
            min: 1,
            max: 100,
          },
        },
        buttons: [
          'Cancel',
          {
            label: 'Ok',
            handler(data) {
              Toast.create(JSON.stringify(data));
            },
          },
        ],
      });
    },
  },
};
</script>

<style lang="stylus">
.valueButton {
  display: inline-block;
}
</style>
