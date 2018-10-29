<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    title: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
      required: true,
    },
    additionalInfo: {
      type: Object,
      default: () => ({}),
    },
    body: {
      type: Boolean,
      default: true,
    },
    form: {
      type: String,
      required: true,
    },
    value: {
      type: Object,
      required: true,
    },
    onRefresh: {
      type: Function,
      default: () => { },
    },
  },
})
export default class WidgetCard extends Vue {
  modalOpen: boolean = false;

  get hasAdditionalInfo() {
    return Object.keys(this.$props.additionalInfo).length > 0;
  }

  get model() {
    return this.$props.value;
  }

  set model(obj: any) {
    this.$emit('input', obj);
  }
}
</script>

<template>
  <div class="widget-container">

    <widget-modal
      :isOpen="modalOpen"
      :onClose="() => { this.modalOpen = false; }"
      :title="$props.title"
    >
      <q-collapsible
        icon="info"
        label="Additional info"
        v-if="hasAdditionalInfo"
      >
        <q-list no-border dark>
          <p
            v-for="(val, key) in $props.additionalInfo"
            :key="key"
          >
            {{ key }}: {{ val }}
          </p>
        </q-list>
      </q-collapsible>
      <component
        :is="$props.form"
        v-model="model"
      />
    </widget-modal>

    <widget-toolbar
      :name="$props.title"
      :type="$props.subTitle"
      :on-refresh="$props.onRefresh"
      :on-settings="() => { this.modalOpen = true }"
    />

    <q-scroll-area
      v-if="$props.body"
      class="widget-body"
    >
      <q-card>
        <q-card-main class="row">

          <slot />

        </q-card-main>
      </q-card>
    </q-scroll-area>

    <slot v-else />

  </div>
</template>

<style scoped>
</style>

