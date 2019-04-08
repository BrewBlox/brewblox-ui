<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { RIGHT } from '../getters';
import { Link } from '@/helpers/units';
import { Block } from '@/plugins/spark/state';
import { blocks } from '@/plugins/spark/store/getters';
import { Watch } from 'vue-property-decorator';
import { saveBlock } from '@/plugins/spark/store/actions';

@Component
export default class ActuatorValve extends PartComponent {
  $q: any;

  get paths() {
    return {
      outerValve: [
        'M0,21h10.5c1.4-5.1,5.4-9.1,10.5-10.5C29,8.3,37.2,13,39.4,21h0.1H50',
        'M0,29h10.5h0C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29h0.1H50',
      ],
      innerValve: [
        'M39.4,21C37.2,13,29,8.3,21,10.5c-5.1,1.4-9.1,5.4-10.5,10.5H39.4z',
        'M10.5,29C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29H10.5z',
      ],
      powerIcon: `
        M27.7,9.5c-0.7,1.1-1.4,2.2-2.3,3.2c-0.4,0.5-0.8,1-1.2,1.5
        s-0.9,1-1.3,1.4L22.3,14c1.8-0.1,3.6-0.1,5.5,0l2.4,0.1l-1.7,1.5
        c-0.5,0.4-1,0.9-1.4,1.3s-1,0.8-1.5,1.2c-1,0.8-2.1,1.6-3.2,2.3
        c0.7-1.1,1.5-2.2,2.3-3.2c0.4-0.5,0.8-1,1.2-1.5
        c0.4-0.5,0.9-1,1.3-1.4l0.7,1.6c-1.8,0.1-3.6,0.1-5.5,0l-2.3-0.1
        l1.7-1.5c0.5-0.4,1-0.9,1.5-1.3c0.5-0.4,1-0.8,1.5-1.3
        C25.6,10.9,26.6,10.2,27.7,9.5z`,
      openLiquid: [
        'm0,25h50',
      ],
      closedLiquid: [
        'm0,25h19',
        'm31,25h50',
      ],
      arrows: 'M0,25H50',
    };
  }

  get actuatorServiceId(): string {
    return this.part.settings.actuatorServiceId;
  }

  get actuatorLink(): Link {
    return this.part.settings.actuatorLink;
  }

  get actuatorBlock(): Block | null {
    if (!this.actuatorServiceId || !this.actuatorLink || !this.actuatorLink.id) {
      return null;
    }
    return blocks(this.$store, this.actuatorServiceId)[this.actuatorLink.id];
  }

  get flowSpeed() {
    return this.flowOnCoord(RIGHT);
  }

  get liquids() {
    return this.liquidOnCoord(RIGHT);
  }

  get closed() {
    return Boolean(this.state.closed);
  }

  get valveRotation() {
    if (this.actuatorBlock) {
      switch (this.actuatorBlock.data.state) {
        case 0:
          return 90;
        case 1:
          return 0;
        default:
          return 45;
      }
    }
    return this.closed ? 90 : 0;
  }

  @Watch('actuatorBlock', { immediate: true, deep: true })
  updateClosed() {
    const closed = !!this.actuatorBlock
      ? this.actuatorBlock.data.state !== 1
      : true;

    if (closed !== this.part.state.closed) {
      this.state.closed = closed;
      this.savePartState();
    }
  }

  toggleClosed() {
    if (this.actuatorBlock) {
      this.actuatorBlock.data.state = this.closed ? 1 : 0;
      saveBlock(this.$store, this.actuatorServiceId, this.actuatorBlock);
      return;
    }
    this.$q.notify({
      message: 'Actuator Block not linked',
      color: 'negative',
      icon: 'error',
    });
  }
}
</script>

<template>
  <g class="actuator-valve clickable" @click="toggleClosed">
    <!-- background element, to make the full square clickable -->
    <rect :width="sizeX*SQUARE_SIZE" :height="sizeY*SQUARE_SIZE" fill="black" opacity="0"/>
    <foreignObject v-if="!actuatorBlock" :height="SQUARE_SIZE" :width="SQUARE_SIZE">
      <q-icon name="mdi-link-variant-off" size="sm" class="absolute-right" style="height: 15px;"/>
    </foreignObject>
    <g key="valve-outer" class="outline">
      <path :d="paths.outerValve[0]"/>
      <path :d="paths.outerValve[1]"/>
    </g>
    <LiquidStroke v-if="closed" :paths="paths.closedLiquid" :colors="liquids"/>
    <LiquidStroke v-else :paths="paths.openLiquid" :colors="liquids"/>
    <g key="valve-inner" :transform="`rotate(${valveRotation}, 25, 25)`" class="fill outline inner">
      <path :d="paths.innerValve[0]"/>
      <path :d="paths.innerValve[1]"/>
      <g class="power-icon">
        <path :d="paths.powerIcon"/>
      </g>
    </g>
    <AnimatedArrows key="valve-arrows" :speed="flowSpeed" :path="paths.arrows"/>
  </g>
</template>

<style lang="stylus" scoped>
/deep/ .power-icon path {
  stroke-width: 1px;
  stroke: black;
  fill: black;
}
</style>
