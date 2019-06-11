import Link from './Link';

export class ProcessValueLink extends Link {
  public constructor(id: string | null) {
    super(id, 'ProcessValueInterface');
  }
}

export class TempSensorLink extends Link {
  public constructor(id: string | null) {
    super(id, 'TempSensorInterface');
  }
}

export class SetpointSensorPairLink extends Link {
  public constructor(id: string | null) {
    super(id, 'SetpointSensorPairInterface');
  }
}

export class ActuatorAnalogLink extends Link {
  public constructor(id: string | null) {
    super(id, 'ActuatorAnalogInterface');
  }
}

export class ActuatorDigitalLink extends Link {
  public constructor(id: string | null) {
    super(id, 'ActuatorDigitalInterface');
  }
}

export class BalancerLink extends Link {
  public constructor(id: string | null) {
    super(id, 'BalancerInterface');
  }
}

export class MutexLink extends Link {
  public constructor(id: string | null) {
    super(id, 'MutexInterface');
  }
}

export class DS2413Link extends Link {
  public constructor(id: string | null) {
    super(id, 'DS2413');
  }
}

export class IoArrayLink extends Link {
  public constructor(id: string | null) {
    super(id, 'IoArray');
  }
}
