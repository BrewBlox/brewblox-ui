<script lang="ts">
import Component from 'vue-class-component';

import BlockComponent from '@/components/BlockComponent';
import ProfilesBar from '@/components/ProfilesBar/ProfilesBar';

import { getById } from './getters';

/* eslint-disable indent */
@Component({
  components: {
    ProfilesBar
  },
  props: {
    id: {
      default: "",
      type: String
    }
  }
})
/* eslint-enable */
export default class InactiveObject extends BlockComponent {
  get block() {
    return getById(this.$store, this.$props.id);
  }
}
</script>

<template>
  <q-card>

    <q-card-title>InactiveObject ({{ id }})</q-card-title>
    <profiles-bar :id="id"/>

    <q-card-main>
      <q-list>

        <q-item>
          <q-item-main>
            <q-item-tile label>Actual Type</q-item-tile>
            <q-item-tile sublabel>{{ block.data.actualType }}</q-item-tile>
          </q-item-main>
        </q-item>

      </q-list>
    </q-card-main>

  </q-card>
</template>
