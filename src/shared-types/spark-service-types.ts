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

// #region SparkStateEvent
export interface SparkStateEvent {
  key: string;
  type: 'Spark.state';
  ttl: string;
  data: {
    status: ApiSparkStatus | null;
    blocks: Block[];
  };
}
// #endregion SparkStateEvent
