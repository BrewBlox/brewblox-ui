<script lang="ts">
import { defineComponent } from 'vue';

import { useWidget } from '@/composables';

const replacements = {
  StepView: 'QuickActions',
};

export default defineComponent({
  name: 'DeprecatedWidget',
  setup() {
    const { widget, saveWidget } = useWidget.setup();
    saveWidget({
      ...widget.value,
      feature: replacements[widget.value.feature] ?? 'Unknown',
    });
    return {};
  },
  render() {
    return null;
  },
});
</script>
