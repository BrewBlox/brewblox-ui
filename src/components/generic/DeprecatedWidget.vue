<script lang="ts">
import { defineComponent } from 'vue';

import { useWidget } from '@/composables';
import { Widget } from '@/store/dashboards';

const replacements = {
  StepView: 'QuickActions',
};

export default defineComponent({
  name: 'DeprecatedWidget',
  props: {
    ...useWidget.props,
  },
  setup(props) {
    const { crud, saveWidget } = useWidget.setup(props.crud, props.context);
    const widget: Widget = {
      ...crud.widget,
      feature: replacements[crud.widget.feature] ?? 'Unknown',
    };
    saveWidget(widget);
    return {};
  },
  render() {
    return null;
  },
});
</script>
