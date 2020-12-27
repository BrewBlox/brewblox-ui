import { StoreObject, UUID } from './generic-types';

export interface ReqBlockAddress {
  serviceId: string;
  type: string;
  id: string;
}

export type Method =
  | 'get' | 'GET'
  | 'delete' | 'DELETE'
  | 'head' | 'HEAD'
  | 'options' | 'OPTIONS'
  | 'post' | 'POST'
  | 'put' | 'PUT'
  | 'patch' | 'PATCH'
  | 'link' | 'LINK'
  | 'unlink' | 'UNLINK'

export type AutomationStatus =
  | 'Invalid'     // Configuration missing or invalid.
  | 'Created'     // In progress. Not yet evaluated.
  | 'Active'      // In progress.
  | 'Retrying'    // In progress. Attempting to automatically recover from error.
  | 'Paused'      // In progress. Execution temporarily halted.
  | 'Finished'    // End state. Success.
  | 'Cancelled'   // End state. Execution prematurely ended.

/**
 * Serialized Date value (number in ms, or ISO-8601)
 */
export type DateTime = number | string;

export interface SandboxError {
  message: string;
  line: number;
}

export interface SandboxResult {
  date: DateTime;
  returnValue: any;
  messages: any[];
  error?: SandboxError;
}

/**
 * Update block.data with given object.
 */
export interface BlockPatchImpl {
  type: 'BlockPatch';

  /**
   * @nullable
   */
  serviceId: string | null;

  /**
   * @nullable
   */
  blockId: string | null;

  /**
   * @nullable
   */
  blockType: string | null;

  /**
   * @nullable
   */
  data: object;
}

/**
 * Edit or create a Task.
 * Status can be checked later with the TaskStatusImpl condition.
 */
export interface TaskEditImpl {
  type: 'TaskEdit';
  ref: string;

  /**
   * @nullable
   */
  title: string | null;

  /**
   * @nullable
   */
  message: string | null;

  /**
   * @nullable
   */
  status: AutomationStatus | null;
}

/**
 * Send a HTTP request to an endpoint
 */
export interface WebhookImpl {
  type: 'Webhook';
  url: string;
  method: Method;
  headers: Record<string, string>;
  body: string;
}

/**
 * Evaluate user-defined code
 */
export interface JSApplyImpl {
  type: 'JSApply';
  body: string;
}

/**
 * Waits until current time is later than desired.
 * Evaluate: now() > time.
 */
export interface TimeAbsoluteImpl {
  type: 'TimeAbsolute';

  /**
   * @nullable
   */
  time: DateTime | null;
}

/**
 * Waits until enough time has elapsed since start point.
 * Evaluate: now() > start + duration.
 */
export interface TimeElapsedImpl {
  type: 'TimeElapsed';
  start: 'Process' | 'Step';
  duration: number; // milliseconds
}

/**
 * A specific field in block.data must compare truthy.
 * Evaluate: block.data[key] OPERATOR value
 */
export interface BlockValueImpl {
  type: 'BlockValue';
  /** @nullable */
  serviceId: string | null;
  /** @nullable */
  blockId: string | null;
  /** @nullable */
  blockType: string | null;
  /** @nullable */
  key: string | null;
  value: any;
  operator: 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt';
}

/**
 * Evaluate user-defined code.
 * Script must return boolean true
 */
export interface JSCheckImpl {
  type: 'JSCheck';
  body: string;
}

/**
 * Compare status of matching tasks with given status.
 * Evaluate: validTasks.all(task => task.status === status)
 */
export interface TaskStatusImpl {
  type: 'TaskStatus';
  ref: string;
  status: AutomationStatus;
  /** @nullable */
  resetStatus: AutomationStatus | null;
}

export interface AutomationTask extends StoreObject {
  ref: string; // not required to be unique
  title: string;
  message: string;
  status: AutomationStatus;

  // processId/stepId are set if task is created by a process
  createdBy: 'User' | 'Action' | 'Condition';
  processId?: UUID;
  stepId?: UUID;
}

/**
 * Generic type for all action / condition Impl types.
 * They all must define a constant string value as their 'type' field.
 */
export interface AutomationImpl {
  type: string;
}

export type ActionImpl =
  | BlockPatchImpl
  | TaskEditImpl
  | WebhookImpl
  | JSApplyImpl

export type ConditionImpl =
  | TimeAbsoluteImpl
  | TimeElapsedImpl
  | BlockValueImpl
  | JSCheckImpl
  | TaskStatusImpl

export interface AutomationItem<T extends AutomationImpl = AutomationImpl> {
  id: string;
  title: string;
  enabled: boolean;
  impl: T;
}

export type AutomationAction<T extends ActionImpl = ActionImpl> = AutomationItem<T>;
export type AutomationCondition<T extends ConditionImpl = ConditionImpl> = AutomationItem<T>;

/**
 * Object defining how a process can move from one step to another.
 * Combining transitions allows for branching and while() behavior.
 */
export interface AutomationTransition {
  id: UUID;
  enabled: boolean;
  conditions: AutomationCondition[];

  /**
   * true: next step
   * false: exit process
   * string: step ID
   */
  next: boolean | string;
}

/**
 * The static definition for process functionality.
 * First, actions are applied.
 * Then, transitions are checked until one evaluates truthy.
 *
 * Steps are not changed during a process, and may be visited multiple times.
 */
export interface AutomationStep {
  id: UUID;
  title: string;
  preconditions: AutomationCondition[];
  actions: AutomationAction[];
  transitions: AutomationTransition[];
}

/**
 * The static configuration for a process.
 */
export interface AutomationTemplate extends StoreObject {
  title: string;
  steps: AutomationStep[];
}

export type AutomationStepActivePhase =
  | 'Created'           // In progress. Not yet evaluated.
  | 'Preconditions'     // In progress. Checking preconditions.
  | 'Actions'           // In progress. Applying actions.
  | 'Transitions'       // In progress. Checking transitions.

export type AutomationStepPhase =
  | AutomationStepActivePhase
  | 'Invalid'           // Configuration missing or invalid.
  | 'Finished'          // End state. Success.
  | 'Cancelled'         // End state. Execution prematurely ended.

/**
 * A single result from process execution.
 * These are treated as immutable: if the process advances, a new result is added.
 * The last result is treated as current.
 */
export interface AutomationStepResult {
  id: UUID;
  date: DateTime;
  /** @nullable */
  stepId: UUID | null;
  phase: AutomationStepPhase;
  status: AutomationStatus;
  error?: string;
}

/**
 * An external instruction for a process to fast-forward to a step.
 */
export interface AutomationStepJump {
  processId: UUID;
  stepId: UUID;
  phase?: AutomationStepActivePhase;
}

/**
 * The runtime configuration and history for process execution.
 * A template is copied into a process.
 * Further changes to the template will not change a running process.
 */
export interface AutomationProcess extends AutomationTemplate {
  results: AutomationStepResult[];
}

/**
 * Data payload of state events pushed by the automation service.
 */
export interface AutomationEventData {
  processes: AutomationProcess[];
  tasks: AutomationTask[];
}

export interface AutomationEvent {
  key: string; // Service ID
  type: 'automation.active';
  data: AutomationEventData;
}
