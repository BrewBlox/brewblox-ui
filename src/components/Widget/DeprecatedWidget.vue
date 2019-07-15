<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';

const replacements = {
  ProcessView: 'Builder',
};

@Component
export default class DeprecatedWidget extends WidgetBase {
  created() {
    this.saveWidget({ ...this.widget, feature: replacements[this.widget.feature] || 'Unknown' });
  }

  render() {
    return null;
  }
}
</script>
