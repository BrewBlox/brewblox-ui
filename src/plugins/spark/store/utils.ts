import capitalize from 'lodash/capitalize';

import { ServiceStatus } from '@/store/services';

import { ApiSparkStatus } from '../types';
import { SparkStatus } from '../types';

// /**
//  * Fields where the relation should be ignored because it adds no meaningful information.
//  */
// const IGNORED_RELATIONS: (keyof Block['data'])[] = [
//   'drivenOutputId', // PID
//   'drivenTargetId', // Setpoint, Setpoint Driver, Logic Actuator
//   'drivenActuatorId', // PWM
//   'oneWireBusId', // OneWireTempSensor, DS2408, DS2413
// ];

// /**
//  * Fields where the block that owns the link is considered the relation target.
//  */
// const INVERTED_RELATIONS: (keyof Block['data'])[] = [
//   'inputId', // PID
//   'referenceId', // Setpoint Driver
//   'sensorId', // Setpoint
//   'analog', // Logic Actuator
//   'digital', // Logic Actuator
// ];

// /**
//  * Block types whose relations should be ignored altogether,
//  * because they have no impact on control logic.
//  */
// const IGNORED_BLOCK_RELATIONS: BlockType[] = [BlockType.DisplaySettings];

// /**
//  * Recursively traverses `value` to find all valid and defined links.
//  *
//  * If the link is owned by the target block, the relation must be inverted.
//  * Fields where this happens are listed explicitly in the `INVERTED_RELATIONS` constant.
//  *
//  * @param parentId Owning block ID. Is relation source if not inverted.
//  * @param relation Path to the link that declares the relation.
//  * @param value
//  * @returns
//  */
// function findNestedRelations(
//   parentId: string,
//   relation: string[],
//   value: any,
// ): BlockRelation[] {
//   if (IGNORED_RELATIONS.includes(relation[0])) {
//     return [];
//   } else if (isDefinedLink(value)) {
//     const [source, target] = INVERTED_RELATIONS.includes(relation[0])
//       ? [value.id, parentId]
//       : [parentId, value.id];
//     return [{ source, target, relation }];
//   } else if (isBloxField(value)) {
//     // Ignored:
//     // - driven links
//     // - unset links
//     // - quantities
//     return [];
//   } else if (isObject(value) || isArray(value)) {
//     // Increase recursion level
//     // The output is flattened at each level
//     // This way, empty return values are discarded,
//     // and a flat output array is returned for any given object depth.
//     return Object.entries(value).flatMap(([k, v]) =>
//       findNestedRelations(parentId, [...relation, k], v),
//     );
//   } else {
//     return [];
//   }
// }

// /**
//  * Identifies all relation links between blocks.
//  * Links without a defined `id` value are ignored.
//  *
//  * @param blocks
//  * @returns
//  */
// export function calculateRelations(blocks: Block[]): BlockRelation[] {
//   return blocks.flatMap((block) => {
//     if (IGNORED_BLOCK_RELATIONS.includes(block.type)) {
//       return [];
//     }
//     return findNestedRelations(block.id, [], block.data);
//   });
// }

// interface DriverMapping {
//   [driven: string]: string[];
// }

// /**
//  * Recursively constructs driver chains for all driven blocks.
//  * Chains end when `latest` is not driven, or a circular reference is detected.
//  *
//  * @param drivers Mapping of all driven blocks and their immediate driver(s)
//  * @param chain Active chain to be appended to
//  * @param blockId Currently checked block ID
//  * @returns
//  */
// function generateChains(
//   drivers: DriverMapping,
//   chain: string[],
//   blockId: string,
// ): string[][] {
//   // Check if the driving block is in turn driven
//   const superDrivers: string[] = drivers[blockId];

//   if (superDrivers) {
//     // One or more drivers are found: increase recursion level
//     return superDrivers
//       .filter((driverId) => !chain.includes(driverId)) // Short circuit circular relations
//       .flatMap((driverId) =>
//         generateChains(drivers, [...chain, blockId], driverId),
//       );
//   } else {
//     // The chain stops here
//     return [[...chain, blockId]];
//   }
// }

// /**
//  * Finds driving links in block array, and constructs end-to-end drive chains.
//  * All driven blocks get at least one chain.
//  * If any block in the chain is driven by multiple blocks,
//  * a chain is generated for every connected leaf node (a driving block that is not driven).
//  *
//  * Given a typical fermentation control scheme, with these blocks:
//  * - Heat PID
//  * - Heat PWM
//  * - Heat Actuator
//  * - Cool PID
//  * - Cool PWM
//  * - Cool Actuator
//  * - Spark Pins
//  *
//  * ... the following drive chains will be generated:
//  * - Spark Pins, Heat Actuator, Heat PWM, Heat PID
//  * - Heat Actuator, Heat PWM, Heat PID
//  * - Heat PWM, Heat PID
//  * - Spark Pins, Cool Actuator, Cool PWM, Cool PID
//  * - Cool Actuator, Cool PWM, Cool PID
//  * - Cool PWM, Cool PID
//  *
//  * @param blocks
//  * @returns
//  */
// export function calculateDrivenChains(blocks: Block[]): string[][] {
//   const drivers: DriverMapping = blocks
//     // Collect all driven links
//     .flatMap((block) =>
//       Object.values(block.data)
//         .filter(
//           (obj: any): obj is DefinedLink =>
//             isDefinedLink(obj) && obj.driven === true,
//         )
//         .map((link): [driven: string, driver: string] => [link.id, block.id]),
//     )
//     // Collate all relations, with the key being the driven block,
//     // and the value array being all immediate drivers
//     .reduce((acc: Mapped<string[]>, [driven, driver]) => {
//       const existing = acc[driven] ?? [];
//       acc[driven] = [...existing, driver];
//       return acc;
//     }, {});

//   return Object.keys(drivers).flatMap((key) =>
//     generateChains(drivers, [], key),
//   );
// }

// function hasDigitalConstraints(
//   data: any,
// ): data is { constrainedBy: DigitalConstraintsObj } {
//   return isQuantity(get(data, 'constrainedBy.constraints[0].remaining'));
// }

// function hasAnalogConstraints(
//   data: any,
// ): data is { constrainedBy: AnalogConstraintsObj } {
//   return (
//     typeof get(data, 'constrainedBy.constraints[0].limiting') === 'boolean'
//   );
// }

// /**
//  * Identifies all constraints that are actively limiting output.
//  * A single block may be limited by multiple constraints.
//  *
//  * Constraint descriptions are returned in a prettified format.
//  *
//  * @param blocks
//  * @returns
//  */
// export function calculateLimitations(blocks: Block[]): BlockLimitation[] {
//   return blocks
//     .map((block: Block): BlockLimitation | null => {
//       if (hasDigitalConstraints(block.data)) {
//         return {
//           id: block.id,
//           limitedBy: block.data.constrainedBy.constraints
//             .filter((c) => c.remaining?.value)
//             .map((c) => {
//               const key =
//                 Object.keys(c).find((key) => key !== 'remaining') ?? '??';
//               const label = constraintLabels[key] ?? key;
//               return `${label} (${prettyQty(c.remaining)})`;
//             }),
//         };
//       } else if (hasAnalogConstraints(block.data)) {
//         return {
//           id: block.id,
//           limitedBy: block.data.constrainedBy.constraints
//             .filter((c) => c.limiting)
//             .map((c) => {
//               const key =
//                 Object.keys(c).find((key) => key !== 'limiting') ?? '??';
//               return constraintLabels[key];
//             }),
//         };
//       } else {
//         return null;
//       }
//     })
//     .filter(nullFilter);
// }

export function asSparkStatus(
  serviceId: string,
  status: ApiSparkStatus | null,
): SparkStatus {
  if (!status) {
    return {
      serviceId,
      isServiceReachable: false,
      deviceAddress: null,
      connectionKind: null,
    };
  }

  return {
    serviceId,
    isServiceReachable: true,
    deviceAddress: status.device_address,
    devicePlatform: status.device_info?.platform,
    connectionKind: status.connection_kind,
    isCompatibleFirmware: status.handshake_info?.is_compatible_firmware,
    isLatestFirmware: status.handshake_info?.is_latest_firmware,
    isValidDeviceId: status.handshake_info?.is_valid_device_id,
    isAutoconnecting: status.is_autoconnecting,
    isConnected: status.is_connected,
    isAcknowledged: status.is_acknowledged,
    isSynchronized: status.is_synchronized,
    isUpdating: status.is_updating,
  };
}

function statusDesc(status: SparkStatus): [string, string] {
  if (status.isConnected) {
    if (status.isSynchronized) {
      return ['synchronized', 'green'];
    } else if (status.isCompatibleFirmware) {
      return ['synchronizing', 'yellow'];
    } else if (status.isAcknowledged) {
      return ['incompatible firmware', 'orange'];
    } else {
      return ['Waiting for handshake', 'yellow'];
    }
  } else if (status.isServiceReachable) {
    return ['waiting for connection', 'red'];
  } else {
    return ['unreachable', 'red'];
  }
}

const iconOpts = {
  simulation: 'mdi-console',
  wifi: 'mdi-access-point',
  usb: 'mdi-usb-port',
  unknown: undefined,
};

export function asServiceStatus(status: SparkStatus): ServiceStatus {
  const id = status.serviceId;
  const [descText, color] = statusDesc(status);
  const connectionKind = status.connectionKind ?? 'unknown';
  const icon = iconOpts[connectionKind];
  const desc = capitalize(`${connectionKind} (${descText})`);
  return { id, color, desc, icon };
}
