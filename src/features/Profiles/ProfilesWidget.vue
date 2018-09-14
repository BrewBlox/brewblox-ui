<script lang="ts">
import Component from 'vue-class-component';

import BlockWidget from '@/components/BlockWidget/BlockWidget';
import ProfilesBar from '@/components/WidgetGenerics/ProfilesBar.vue';
import BlockToolbar from '@/components/WidgetGenerics/BlockToolbar.vue';

import { profileNames } from '@/components/SparkService/getters';

import { ProfilesBlock } from './state';
import { getById } from './getters';


/* eslint-disable indent */
@Component({
  components: {
    ProfilesBar,
    BlockToolbar,
  },
})
/* eslint-enable */
export default class ProfilesWidget extends BlockWidget {
  inputMapping = {
    active: { path: 'block.data.active', default: [] },
  };

  get block(): ProfilesBlock {
    return getById(this.$store, this.blockId);
  }

  get names(): string[] {
    return profileNames(this.$store, this.block.serviceId);
  }
}
</script>

<template>
  <div>

    <block-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
    />

    <q-card>
      <q-card-main>
        <q-list>

          <q-item>
            <q-item-main>
              <q-item-tile sublabel>Active Profiles</q-item-tile>
              <q-item-tile>
                <profiles-bar
                  :profiles="inputs.active"
                  :profileNames="names"
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
