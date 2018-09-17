<script lang="ts">
import Component from 'vue-class-component';

import ProfilesBar from '@/components/WidgetGenerics/ProfilesBar.vue';
import BlockToolbar from '@/components/WidgetGenerics/BlockToolbar.vue';
import WidgetModal from '@/components/WidgetGenerics/WidgetModal.vue';
import { saveBlock } from '@/services/SparkService/store/actions';
import { profileNames } from '@/services/SparkService/store/getters';
import BlockWidget from '../BlockWidget.ts';
import ProfilesForm from './ProfilesForm.vue';
import { ProfilesBlock } from './state';
import { getById } from './getters';

/* eslint-disable indent */
@Component({
  components: {
    ProfilesBar,
    BlockToolbar,
    WidgetModal,
    ProfilesForm,
  },
})
/* eslint-enable */
export default class ProfilesWidget extends BlockWidget {
  inputMapping = {
    active: { path: 'block.data.active', default: [] },
  };
  modalOpen: boolean = false;

  get block(): ProfilesBlock {
    return getById(this.$store, this.blockId);
  }

  get names(): string[] {
    return profileNames(this.$store, this.block.serviceId);
  }

  get active(): number[] {
    return this.block.data.active;
  }

  set active(vals: number[]) {
    this.save({
      ...this.block,
      data: {
        ...this.block.data,
        active: vals,
      },
    });
  }

  save(block: ProfilesBlock) {
    saveBlock(this.$store, block);
  }
}
</script>

<template>
  <div>

    <widget-modal
      :isOpen="modalOpen"
      :onClose="() => { this.modalOpen = false; }"
      title="Profiles Settings"
    >
      <profiles-form
        :block="block"
        :onBlockUpdate="save"
      />
    </widget-modal>

    <block-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
      :on-settings="() => { this.modalOpen = true; }"
    />

    <q-card>
      <q-card-main>
        <q-list>

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
