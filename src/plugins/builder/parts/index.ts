import { Component } from 'vue';

import { autoComponents } from '@/utils/component-ref';

const parts: { [name: string]: Component } = autoComponents(require.context('./'));

export default parts;
