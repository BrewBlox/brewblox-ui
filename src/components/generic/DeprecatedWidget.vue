<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';

const replacements = {
  StepView: 'QuickActions',
};

@Component
export default class DeprecatedWidget extends WidgetBase {
  created(): void {
    this.widget.feature = replacements[this.widget.feature] ?? 'Unknown';
    this.saveWidget();
  }

  render(): null {
    return null;
  }
}
</script>
