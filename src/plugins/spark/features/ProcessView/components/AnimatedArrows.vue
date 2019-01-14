<script lang="ts">
/* eslint-disable vue/attribute-hyphenation */
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    path: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 2,
    },
    numArrows: {
      type: Number,
      default: 2,
    },
    reversed: {
      type: Boolean,
      default: false,
    },
  },
})
export default class AnimatedArrows extends Vue {
  get starts(): string[] {
    const interval = this.$props.duration / this.$props.numArrows;
    return [...Array(this.$props.numArrows).keys()]
      .map(idx => `${idx * interval}s`);
  }

  get transform() {
    // Flips the arrow
    return this.$props.reversed
      ? 'scale (-1, 1)'
      : '';
  }

  get keyPoints() {
    // Makes the arrow travel end-to-start
    return this.$props.reversed
      ? '1;0'
      : '0;1';
  }

  mounted(){
    interface AnimateMotion extends Element {
      beginElement();
    }
    const allAnimations = document.getElementsByTagName('animateMotion');
    console.dir(allAnimations);
    [...allAnimations].forEach(element => {
      (element as AnimateMotion).beginElement();
    });
  }
}
</script>

<template>
  <g>
    <g v-for="start in starts" :key="start" visibility="hidden">
      <path :transform="transform" d="M0,0 l4,4 l-4,4" class="outline"/>
      <!-- Note: SVG attributes are case-sensitive -->
      <animateMotion 
        :path="$props.path"
        :begin="start"
        :keyPoints="keyPoints"
        :dur="`${$props.duration}s`"
        fill="freeze"
        repeatCount="indefinite"
        rotate="auto"
        calcMode="linear"
        keyTimes="0;1"
      />
      <set :begin="start" attributeName="visibility" from="hidden" to="visible"/>
    </g>
  </g>
</template>
