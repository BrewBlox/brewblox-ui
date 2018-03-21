import Vue from 'vue';
import Component from 'vue-class-component';

import GridItem from './grid-item.vue';

@Component({
  components: { GridItem },
})
export default class GridContainer extends Vue {
  interaction: boolean = false;

  startInteraction() {
    this.interaction = true;
  }

  stopInteraction() {
    this.interaction = false;
  }

  render(createElement: Function) {
    return createElement(
      'div',
      {
        class: 'grid-container',
      },
      [
        createElement(
          'div',
          {
            class: 'grid-main-container',
          },
          this.$slots.default
            .filter(slot => slot.tag)
            .map((slot: any) => createElement(
              GridItem,
              {
                props: slot.data.attrs || {},
              },
              [slot],
            )),
        ),
        this.interaction ? createElement(
          'div',
          {
            class: 'grid-container-overlay',
          },
          [
            createElement(
              'div',
              {
                class: 'grid-container-overlay-grid',
              },
            ),
          ],
        ) : null,
      ],
    );
  }
}
