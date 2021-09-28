import { Block } from './spark-block-types';

// #region SparkFirmwareInfo
export interface SparkFirmwareInfo {
  firmware_version: string;
  proto_version: string;
  firmware_date: string;
  proto_date: string;
  device_id: string;
}

export interface SparkServiceInfo extends SparkFirmwareInfo {
  name: string;
}

export interface SparkDeviceInfo extends SparkFirmwareInfo {
  system_version: string;
  platform: string;
  reset_reason: string;
}

export interface SparkHandshakeInfo {
  is_compatible_firmware: boolean;
  is_latest_firmware: boolean;
  is_valid_device_id: boolean;
}
// #endregion SparkFirmwareInfo

// #region ApiSparkStatus
export interface ApiSparkStatus {
  device_address: string | null;
  connection_kind: 'simulation' | 'usb' | 'wifi' | null;

  service_info: SparkServiceInfo;
  device_info: SparkDeviceInfo | null;
  handshake_info: SparkHandshakeInfo | null;

  is_autoconnecting: boolean;
  is_connected: boolean;
  is_acknowledged: boolean;
  is_synchronized: boolean;
  is_updating: boolean;
}
// #endregion ApiSparkStatus

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
    status: ApiSparkStatus | null;
    blocks: Block[];
    relations: BlockRelation[];
    drive_chains: BlockDriveChain[];
  };
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
