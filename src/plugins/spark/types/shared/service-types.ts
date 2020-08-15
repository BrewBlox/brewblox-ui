
// #region ApiSparkStatus
interface ApiFirmwareInfo {
  firmware_version: string;
  proto_version: string;
  firmware_date: string;
  proto_date: string;
  device_id: string;
}

interface ApiServiceInfo extends ApiFirmwareInfo {
  name: string;
}

interface ApiDeviceInfo extends ApiFirmwareInfo {
  system_version: string;
  platform: string;
  reset_reason: string;
}

interface ApiHandshakeInfo {
  is_compatible_firmware: boolean;
  is_latest_firmware: boolean;
  is_valid_device_id: boolean;
}

export interface ApiSparkStatus {

  /**
   * Address of currently connected controller.
   * Can be either a path to a serial tty, or an 'IP:port' network address.
   */
  device_address: string | null;

  /**
   * Actual connection type.
   */
  connection_kind: 'simulation' | 'usb' | 'wifi' | null;

  /**
   * Static information of the service,
   * including that of associated firmware binaries.
   */
  service_info: ApiServiceInfo;

  /**
   * Static information of currently connected controller.
   */
  device_info: ApiDeviceInfo | null;

  /**
   * Status flags for current connection.
   * Firmware compatibility is checked in the handshake.
   */
  handshake_info: ApiHandshakeInfo | null;

  /**
   * Autoconnecting can be disabled for services
   * where the controller is expected to be unreachable for long periods of time.
   *
   * The service will wait for `is_autoconnecting` to be true before it starts discovery.
   */
  is_autoconnecting: boolean;

  /**
   * Is the service connected to either a serial device, or an IP address?
   * Does not guarantee the connected device is a Spark controller,
   * or that the controller is compatible.
   */
  is_connected: boolean;

  /**
   * Has the connected controller sent a handshake message?
   * Does not guarantee the controller is compatible.
   */
  is_acknowledged: boolean;

  /**
   * Service is connected, compatible, and communicating.
   */
  is_synchronized: boolean;
}
// #endregion ApiSparkStatus
