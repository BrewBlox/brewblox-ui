<script lang="ts">
import { date as qdate } from 'quasar';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    field: {
      type: [Number, String, Object],
      required: false,
    },
    change: {
      type: Function,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: 'span',
    },
    short: {
      type: Boolean,
      default: false,
    },
    resetIcon: {
      type: String,
      default: 'restore',
    },
    clearLabel: {
      type: String,
      default: '<not set>',
    },
  },
})
export default class DatetimePopupEdit extends Vue {
  $refs!: {
    qDateProxy: any;
    qTimeProxy: any;
  }

  placeholder: Date | null = null;
  timePlaceholder = '';
  datePlaceholder = '';

  get dateString() {
    if (!this.$props.field) {
      return this.$props.clearLabel;
    }
    const date = new Date(this.$props.field);
    return this.$props.short
      ? date.toLocaleDateString()
      : date.toLocaleString();
  }

  startEdit() {
    this.setDateValues(this.$props.field);
  }

  setDateValues(v: any) {
    this.placeholder = new Date(v);
    this.datePlaceholder = qdate.formatDate(this.placeholder, 'YYYY/MM/DD');
    this.timePlaceholder = qdate.formatDate(this.placeholder, 'HH:mm:ss');
  }

  save() {
    const [year, month, date] = this.datePlaceholder.split('/');
    const [hours, minutes] = this.timePlaceholder.split(':');
    this.placeholder = qdate.buildDate({ year, month, hours, minutes, date });
    this.$props.change(this.placeholder);
  }

  closeDialog() {
    this.$refs.qDateProxy.hide();
    this.$refs.qTimeProxy.hide();
  }
}
</script>

<template>
  <div>
    <component :is="$props.tag" class="editable">{{ dateString }}</component>
    <q-popup-edit
      :disable="$attrs.disabled"
      :title="$props.label"
      v-model="placeholder"
      label-set="apply"
      buttons
      persistent
      @show="startEdit"
      @save="save"
    >
      <div class="help-text text-weight-light q-my-md">
        <slot/>
      </div>
      <q-item dark>
        <q-item-section>
          <q-input v-model="datePlaceholder" :rules="['date']" dark mask="date">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy">
                  <q-date v-model="datePlaceholder" dark @input="closeDialog"/>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-input v-model="timePlaceholder" :rules="['time']" dark mask="time">
            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy ref="qTimeProxy">
                  <q-time v-model="timePlaceholder" dark format24h @input="closeDialog"/>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-btn
            :icon="$props.resetIcon"
            flat
            dense
            label="now"
            class="text-white"
            @click="setDateValues(new Date())"
          />
        </q-item-section>
      </q-item>
    </q-popup-edit>
  </div>
</template>

<style lang="stylus" scoped>
@import './popups.styl';
</style>
