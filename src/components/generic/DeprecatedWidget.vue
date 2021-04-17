<script lang="ts">
import { defineComponent } from 'vue';

import { useWidget } from '@/composables';

const replacements = {
  StepView: 'QuickActions',
};

export default defineComponent({
  name: 'DeprecatedWidget',
  props: {
    ...useWidget.props,
  },
  setup(props) {
    const { widget, saveWidget } = useWidget.setup(props.widgetId);
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
