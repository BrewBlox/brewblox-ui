import { StoreObject } from 'brewblox-proto/ts';

/**
 * Persistent data for service objects.
 */
export interface Service<ConfigT = any> extends StoreObject {
  /**
   * Unique ID. Must be URL-safe, as it is used in routing.
   * Typically matches the name of the corresponding backend service.
   */
  id: string;

  /**
   * Human-friendly display name. Does not have to be unique.
   */
  title: string;

  /**
   * Services are rendered in a tree structure.
   * Directories do not have to be created.
   * They will be present if present in at least one Service dir.
   * Values are /-separated, and are not used in routing.
   */
  dir?: string;

  /**
   * Foreign key to `ServiceFeature.id`
   */
  type: string;

  /**
   * Configuration data. Can be freely used by the service itself.
   * Will only be used by the controlling ServiceFeature
   */
  config: ConfigT;
}

/**
 * Pending / not yet configured service.
 * Used for suggesting services to users.
 * Stubs will be automatically removed whenever a service with the same ID is added.
 */
export interface ServiceStub {
  /**
   * Unique ID. Must be URL-safe, as it is used in routing.
   * Typically matches the name of the corresponding backend service.
   * Used to seed the ID of a created Service.
   */
  id: string;

  /**
   * Foreign key to `ServiceFeature.id`
   */
  type: string;
}

/**
 * Volatile status info for services.
 * Used to provide feedback to users on connection state.
 */
export interface ServiceStatus {
  /**
   * Unique ID. Must match that of existing service.
   */
  id: string;

  /**
   * Status indicator.
   */
  color: string;

  /**
   * Human readable text.
   */
  desc: string;

  /**
   * Optional icon. Must be a valid Quasar icon name.
   */
  icon?: string;
}
