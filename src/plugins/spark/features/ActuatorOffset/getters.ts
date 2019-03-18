import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { ActuatorOffsetBlock } from './state';
import { SetpointSensorPairLink } from '@/helpers/units/KnownLinks';

export const typeName = 'ActuatorOffset';

export const getById =
  (store: RootStore, serviceId: string, id: string): ActuatorOffsetBlock =>
    blockById<ActuatorOffsetBlock>(store, serviceId, id, typeName);

export const defaultData =
  (): any => ({
    targetId: new SetpointSensorPairLink(null),
    referenceId: new SetpointSensorPairLink(null),
    referenceSettingOrValue: 0,
    setting: 0,
    value: 0,
    constrainedBy: { constraints: [] },
    enabled: true,
  });

export const presets =
  (): any[] => ([
    {
      label: 'HLT setpoint driver',
      value: {
        referenceSettingOrValue: 0,
        constrainedBy: { constraints: [{ max: 10 }] },
      },
    },
    {
      label: 'Fridge setpoint driver',
      value: {
        referenceSettingOrValue: 0,
        constrainedBy: { constraints: [{ min: -20 }, { max: 20 }] },
      },
    },
  ]);
