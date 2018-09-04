<script lang="ts">
import Component, { mixins } from 'vue-class-component';

import BlockWidget from '@/components/BlockWidget';
import ProfilesBar from '@/components/ProfilesBar/ProfilesBar.vue';

import { ProfilesBlock } from './state';
import { getById } from './getters';


/* eslint-disable indent */
@Component({
  components: {
    ProfilesBar
  }
})
/* eslint-enable */
export default class ProfilesWidget extends mixins(BlockWidget) {
  inputMapping = {
    active: { path: 'block.data.active', default: [] },
  };

  get block(): ProfilesBlock {
    return getById(this.$store, this.blockId);
  }
}
</script>

<template>
  <div>
    <q-toolbar color="dark-bright">
      <q-toolbar-title>
        {{ block.serviceId }}/{{ block.id }}
        <q-item-tile sublabel>{{ displayName }}</q-item-tile>
      </q-toolbar-title>
    </q-toolbar>

    <q-card>
      <q-card-main>
        <q-list>

          <q-item>
            <q-item-main>
              <q-item-tile sublabel>Active Profiles</q-item-tile>
              <q-item-tile>
                <profiles-bar
                  :profiles="inputs.active"
                />
              </q-item-tile>
            </q-item-main>
          </q-item>

        </q-list>
      </q-card-main>
    </q-card>

  </div>
</template>

<style scoped>
.q-list {
  border: 0;
}

.q-item {
  display: grid;
  grid-gap: 10px;
}

.grid-items-2 {
  grid-template-columns: 1fr 1fr;
}

.q-item-side {
  text-align: center;
  margin-left: 0;
}
</style>
