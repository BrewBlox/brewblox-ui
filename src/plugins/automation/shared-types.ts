/**
 * The types in this file are relevant to both the automation service and the UI.
 */
import { Method } from 'axios';

/**
 * Generic status type for Automation types.
 * It is used by multiple types.
 */
export type AutomationStatus =
  'Invalid'       // Configuration missing or invalid.
  | 'Created'     // In progress. Not yet evaluated.
  | 'Active'      // In progress.
  | 'Retrying'    // In progress. Attempting to automatically recover from error.
  | 'Paused'      // In progress. Execution temporarily halted.
  | 'Finished'    // End state. Success.
  | 'Cancelled';  // End state. Execution prematurely ended.

/** @nullable */
type Datum = number | null;

/**
 * @pattern ^[0-9a-fA-F\-]{36}$
 */
type UUID = string;

/**
 * Required fields for an object to be stored in the datastore.
 */
export interface StoreObject {
  id: UUID;

  /**
   * Is defined by the datastore when object is first created.
   * Objects with a _rev can't be created.
   * Objects without a _rev can't be saved or removed.
   */
  _rev?: string;
}

export interface AutomationTask extends StoreObject {
  /**
   * User-defined reference ID.
   * Not required to be unique.
   */
  ref: string;

  /**
   * Human-readable name.
   */
  title: string;

  /**
   * Message body.
   */
  message: string;

  /**
   * Current status. May be evaluated by TaskStatusImpl
   */
  status: AutomationStatus;

  /**
   * Tasks can be created manually, or by a process.
   * If created by a process, processId and stepId will be set.
   * This allows multiple processes to re-use the same ref.
   */
  createdBy: 'User' | 'Action' | 'Condition';

  /**
   * Set if automatically created.
   */
  processId?: UUID;

  /**
   * Set if automatically created.
   */
  stepId?: UUID;
}

////////////////////////////////////////////////////////////////
// Actions
////////////////////////////////////////////////////////////////

/**
 * Update block.data with given object.
 */
export interface BlockPatchImpl {
  type: 'BlockPatch';

  /**
   * Part of the unique identifier for a block.
   * @nullable
   */
  serviceId: string | null;

  /**
   * Part of the unique identifier for a block.
   * @nullable
   */
  blockId: string | null;

  /**
   * Helps rendering and choosing blocks.
   * Can either be a direct type, or an interface type.
   * @nullable
   */
  blockType: string | null;

  /**
   * Data to be merged into the existing block.data object.
   * @nullable
   */
  data: object;
}

/**
 * Create a new Task.
 * Status can be checked later with the TaskStatusImpl condition.
 */
export interface TaskCreateImpl {
  type: 'TaskCreate';

  /**
   * User-defined reference key.
   * Not guaranteed to be unique.
   */
  ref: string;

  /**
   * Human readable title for the created task.
   */
  title: string;

  /**
   * Message for the created task.
   */
  message: string;
}

/**
 * Send a HTTP request to an endpoint
 */
export interface WebhookImpl {
  type: 'Webhook';

  /**
   * Absolute URL to endpoint. May include params.
   */
  url: string;

  /**
   * HTTP method.
   */
  method: Method;

  /**
   * HTTP headers.
   */
  headers: Record<string, string>;

  /**
   * Request body.
   */
  body: string;
}

/**
 * Combining type for all actions.
 */
export type ActionImpl =
  BlockPatchImpl
  | TaskCreateImpl
  | WebhookImpl
  ;

////////////////////////////////////////////////////////////////
// Conditions
////////////////////////////////////////////////////////////////

/**
 * Waits until current time is later than desired.
 * Evaluate: now() > time.
 */
export interface TimeAbsoluteImpl {
  type: 'TimeAbsolute';

  /**
   * Desired time.
   */
  time: Datum;
}

/**
 * Waits until enough time has elapsed since start point.
 * Evaluate: now() > start + duration.
 */
export interface TimeElapsedImpl {
  type: 'TimeElapsed';

  /**
   * Used start point.
   */
  start: 'Process' | 'Step';

  /**
   * In milliseconds.
   */
  duration: number;
}

/**
 * A specific field in block.data must compare truthy.
 * Evaluate: block.data[key] OPERATOR value
 */
export interface BlockValueImpl {
  type: 'BlockValue';

  /**
   * Part of the unique identifier for a block.
   * @nullable
   */
  serviceId: string | null;

  /**
   * Part of the unique identifier for a block.
   * @nullable
   */
  blockId: string | null;

  /**
   * Helps rendering and choosing blocks.
   * Can either be a direct type, or an interface type.
   * @nullable
   */
  blockType: string | null;

  /**
   * Key of a top-level object within block.data.
   * @nullable
   */
  key: string | null;

  /**
   * Compared value.
   */
  value: any;

  /**
   * Comparison approach.
   * The left-hand value is current value (block.data[key]).
   * The right-hand value is the condition value.
   */
  operator: 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt';
}

/**
 * Compare status of matching tasks with given status.
 * Evaluate: validTasks.all(task => task.status === status)
 */
export interface TaskStatusImpl {
  type: 'TaskStatus';

  /**
   * The user-defined reference key.
   * Must match those set in TaskCreate.
   * If multiple tasks share the same ref key,
   * all must match the given status.
   */
  ref: string;

  /**
   * Desired status.
   */
  status: AutomationStatus;
}

/**
 * Combining type for all conditions
 */
export type ConditionImpl =
  TimeAbsoluteImpl
  | TimeElapsedImpl
  | BlockValueImpl
  | TaskStatusImpl
  ;

////////////////////////////////////////////////////////////////
// Generic
////////////////////////////////////////////////////////////////

/**
 * Generic type for all action / condition Impl types.
 * They all must define a constant string value as their 'type' field.
 */
export interface AutomationImpl {
  type: string;
}

/**
 * Common fields for all items.
 * impl is any of the action / condition Impl types.
 */
export interface AutomationItem<T extends AutomationImpl = AutomationImpl> {
  id: string;
  title: string;
  enabled: boolean;
  impl: T;
}

/**
 * Narrowed type: item.impl must be any of the ActionImpl types.
 */
export type AutomationAction<T extends ActionImpl = ActionImpl> = AutomationItem<T>;

/**
 * Narrowed type: item.impl must be any of the ConditionImpl types.
 */
export type AutomationCondition<T extends ConditionImpl = ConditionImpl> = AutomationItem<T>;

/**
 * Object defining how a process can move from one step to another.
 * Combining transitions allows for branching and while() behavior.
 */
export interface AutomationTransition {
  id: UUID;

  /**
   * true: next step
   * false: exit process
   * string: step ID
   */
  next: boolean | string;

  /**
   * A transition must be enabled for it to be evaluated.
   */
  enabled: boolean;

  /**
   * All conditions in a transition must evaluate true.
   */
  conditions: AutomationCondition[];
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

  /**
   * Human-readable name.
   */
  title: string;

  /**
   * Preconditions must evaluate true before actions are applied.
   */
  preconditions: AutomationCondition[];

  /**
   * Actions are applied in order.
   * If any action fails, all are retried.
   */
  actions: AutomationAction[];

  /**
   * Transitions are checked in order.
   * The first transition to evaluate true gets to pick the next step.
   * If no transitions are set, the process immediates continues to the next step.
   */
  transitions: AutomationTransition[];
}

/**
 * The static configuration for a process.
 */
export interface AutomationTemplate extends StoreObject {
  /**
   * Human-readable name.
   */
  title: string;

  /**
   * Step objects.
   * The process always starts at the first step.
   * By default, steps are visited in listed order.
   * Transitions may override this behavior.
   */
  steps: AutomationStep[];
}

export type AutomationStepActivePhase =
  'Created'             // In progress. Not yet evaluated.
  | 'Preconditions'     // In progress. Checking preconditions.
  | 'Actions'           // In progress. Applying actions.
  | 'Transitions'       // In progress. Checking transitions.

export type AutomationStepPhase =
  AutomationStepActivePhase
  | 'Invalid'           // Configuration missing or invalid.
  | 'Finished'          // End state. Success.
  | 'Cancelled';        // End state. Execution prematurely ended.

/**
 * A single result from process execution.
 * These are treated as immutable: if the process advances, a new result is added.
 * The last result is treated as current.
 */
export interface AutomationStepResult {
  id: UUID;

  /**
   * The unique ID for the relevant step.
   * Is null if the result does not apply to any single step.
   * @nullable
   */
  stepId: UUID | null;

  /**
   * Date when the result was generated.
   */
  date: Datum;

  /**
   * Current status for the relevant step.
   * Will be Invalid if stepId is null.
   */
  phase: AutomationStepPhase;

  /**
   * Current status for the entire process.
   * The process will only be evaluated if it is Active.
   */
  status: AutomationStatus;

  /**
   * Optional error message.
   */
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
  /**
   * All execution results from this process.
   * The last result is considered current.
   */
  results: AutomationStepResult[];
}

/**
 * Data payload of state events pushed by the automation service.
 */
export interface AutomationEventData {
  processes: AutomationProcess[];
  tasks: AutomationTask[];
}
