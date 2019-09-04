<script lang="ts">
import PartCard from './PartCard';
import Component from 'vue-class-component';
import get from 'lodash/get';

@Component({
})
export default class ValvePartCard extends PartCard {
  idinput: string = '';

  save(newName: string) {
    this.savePart({
      ...this.part,
      settings: {
        ...this.part.settings,
        valveid: newName,
      },
    });
  }

  mounted() {
    this.idinput = get(this.part.settings, 'valveid', null);
  }
}
</script>

<template>
  <q-list dark>
    <q-separator dark/>
    <q-item dark>
      <q-item-section>
        <q-item-label caption>Valve ID</q-item-label>
        <InputPopupEdit :field="idinput" :change="save" tag="span" label="Valve ID"/>
      </q-item-section>
    </q-item>
  </q-list>
</template>
