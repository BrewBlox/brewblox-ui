import { PartSpec } from '@/plugins/builder/types';
import { autoModules } from '@/utils/component-ref';

export default autoModules<PartSpec>(require.context('./'));
