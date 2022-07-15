import { Block } from './spark-block-types';

// #region SparkDescription
export interface SparkFirmwareDescription {
  /**
   * Git hash of the built commit in the Firmware repository.
   * Firmware is considered mismatched if the service firmware_version
   * does not match the controller firmware_version.
   */
  firmware_version: string;

  /**
   * Git hash of the built commit in the Protobuf message repository.
   * Firmware is considered incompatible if the service proto_version
   * does not match the controller proto_version.
   */
  proto_version: string;

  /**
   * Date (yyyy-mm-dd) when the firmware repository commit was done.
   */
  firmware_date: string;

  /**
   * Date (yyyy-mm-dd) when the Protobuf repository commit was done.
   */
  proto_date: string;
}

export interface SparkDeviceDescription {
  /**
   * Desired or actual device ID.
   * If the service device ID is empty, this is considered a wildcard.
   */
  device_id: string;
}

export interface SparkServiceDescription {
  /**
   * The unique service ID.
   */
  name: string;

  /**
   * The firmware for which the service was built.
   * This is used to determine compatibility with the controller firmware.
   */
  firmware: SparkFirmwareDescription;

  /**
   * Desired device properties.
   * This is used to determine compatibility with the individual controller.
   */
  device: SparkDeviceDescription;
}

export interface SparkControllerDescription {
  /**
   * System library version.
   * The format will be dependent on the platform.
   */
  system_version: string;

  /**
   * The hardware/software platform used by this controller.
   */
  platform: string;

  /**
   * Stated reason for the most recent controller reset.
   */
  reset_reason: string;

  /**
   * The currently running controller firmware.
   */
  firmware: SparkFirmwareDescription;

  /**
   * Controller device properties.
   * These are specific to the individual controller.
   */
  device: SparkDeviceDescription;
}
// #endregion SparkDescription

// #region SparkStatusDescription
export interface SparkStatusDescription {
  /**
   * If false, the service will not automatically
   * discover and connect to a controller.
   *
   * This value is persistent, and stored in the database.
   */
  enabled: boolean;

  /**
   * The configuration values for the service.
   * These are stable during runtime.
   * The expected firmware information is included during the build,
   * and the name and desired device ID are CLI arguments.
   */
  service: SparkServiceDescription;

  /**
   * The configuration values for the controller.
   * These are only available once the controller is connected,
   * and the handshake is performed.
   * They are expected to be constant.
   */
  controller: SparkControllerDescription | null;

  /**
   * The network address of the connected controller.
   * Its format will be dependent on the connection kind.
   * Simulation and TCP addresses will be formatted as `{host}:{port}`,
   * while USB addresses are a path to the TTY device.
   */
  address: string | null;

  /**
   * The transport layer implementation of the active connection.
   */
  connection_kind: 'SIMULATION' | 'USB' | 'TCP' | null;

  /**
   * Before service-to-controller communication can happen,
   * multiple steps must be taken.
   * The state machine will progress linearly,
   * but may revert to DISCONNECTED at any time.
   *
   * - DISCONNECTED: The service is not connected at a transport level.
   *    If enabled, it is continuously trying to discover a valid controller.
   * - CONNECTED: The service is connected at a transport level,
   *    but has not yet received a handshake.
   * - ACKNOWLEDGED: The service has received a handshake.
   *    If the service is compatible with the controller, it will now synchronize.
   *    Otherwise, the process stops here.
   * - SYNCHRONIZED: The connection process is complete,
   *    and block API calls can be made.
   * - UPDATING: The service is still connected to the controller,
   *    but the transport stream has been handed over to the update handler.
   *    Block API calls will immediately return an error.
   */
  connection_status:
    | 'DISCONNECTED'
    | 'CONNECTED'
    | 'ACKNOWLEDGED'
    | 'SYNCHRONIZED'
    | 'UPDATING';

  /**
   * firmware_error is set when the controller firmware description
   * is compared to the service, and there is a mismatch.
   * The error is always cleared if the service becomes disconnected.
   *
   * - INCOMPATIBLE: the firmware expected by the service is different from
   *    the actual controller firmware to a degree that communication
   *    correctness cannot be guaranteed.
   *    The connection process will be stopped.
   * - MISMATCHED: the firmware expected by the service is different from
   *    the actual controller firmware, but the difference is acceptable.
   */
  firmware_error: 'INCOMPATIBLE' | 'MISMATCHED' | null;

  /**
   * identity_error is set when the controller identity is compared to the service,
   * and there is a mismatch.
   * The error is always cleared if the service becomes disconnected.
   *
   * - INCOMPATIBLE: The desired device ID does not match the actual device ID.
   *    This is a hard error: the connection process will be stopped.
   * - WILDCARD_ID: The service does not specify a device ID, and all IDs are valid.
   *    This is a soft error: it is a valid configuration for a system with a single
   *    controller, but will lead to problems if multiple controllers are present.
   */
  identity_error: 'INCOMPATIBLE' | 'WILDCARD_ID' | null;
}
// #endregion SparkStatusDescription

// #region BlockRelation
export interface BlockRelation {
  source: string;
  target: string;
  relation: string[];
}
// #endregion BlockRelation

// #region BlockDriveChain
export interface BlockDriveChain {
  source: string;
  target: string;
  intermediate: string[];
}
// #endregion BlockDriveChain

// #region SparkStateEvent
export interface SparkStateEvent {
  key: string; // Service ID
  type: 'Spark.state';
  data: {
    status: SparkStatusDescription;
    blocks: Block[];
    relations: BlockRelation[];
    drive_chains: BlockDriveChain[];
  } | null;
}
// #endregion SparkStateEvent

// #region SparkUpdateEvent
export interface SparkUpdateEvent {
  key: string; // Service ID
  type: 'Spark.update';
  data: {
    log: string[];
  };
}
// #endregion SparkUpdateEvent

// #region SparkPatchEvent
export interface SparkPatchEvent {
  key: string; // Service ID
  type: 'Spark.patch';
  data: {
    changed: Block[];
    deleted: string[];
  };
}
// #endregion SparkPatchEvent
