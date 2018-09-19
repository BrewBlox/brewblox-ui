<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import ProfilesBar from '@/services/spark/components/ProfilesBar.vue';

import { profileNames } from '@/services/spark/store/getters';
import { updateProfileNames } from '@/services/spark/store/actions';

import { ProfilesBlock } from './state';

@Component({
  components: {
    ProfilesBar,
  },
  props: {
    block: {
      type: Object,
      required: true,
    },
    onBlockUpdate: {
      type: Function,
      required: true,
    },
  },
})
export default class ProfilesForm extends Vue {
  get myBlock(): ProfilesBlock {
    return this.$props.block as ProfilesBlock;
  }

  get names(): string[] {
    return profileNames(this.$store, this.myBlock.serviceId);
  }

  get active(): number[] {
    return [...this.myBlock.data.active];
  }

  set active(values: number[]) {
    this.$props.onBlockUpdate({
      ...this.myBlock,
      data: {
        ...this.myBlock.data,
        active: values,
      },
    });
  }

  updateNames() {
    updateProfileNames(this.$store, this.myBlock.serviceId, [...this.names]);
  }
}
</script>

<template>
  <div>
    <q-list>

      <q-list-header>Active Profiles</q-list-header>

      <q-item>
        <q-item-main>
          <q-item-tile sublabel>Active Profiles</q-item-tile>
          <q-item-tile>
            <profiles-bar
              v-model="active"
              :profileNames="names"
            />
          </q-item-tile>
        </q-item-main>
      </q-item>

      <q-item-separator />
      <q-list-header>Profile Names</q-list-header>

      <q-item
        v-for="(name, idx) in names"
        :key="idx"
      >
        <q-item-main>
          <q-input
            v-model="names[idx]"
            @change="updateNames"
            :suffix="`Profile ${idx + 1}`"
          />
        </q-item-main>
      </q-item>

    </q-list>
  </div>
</template>

<style scoped>
.q-item {
  display: grid;
  grid-gap: 10px;
}

.grid-items-2 {
  grid-template-columns: 1fr 1fr;
}

.grid-items-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.q-item-side {
  text-align: center;
  margin-left: 0;
}

.q-item-section {
  margin-left: 0;
}

.modal .q-list {
  border: 0;
}
</style>
