import Link from './Link';

export class ProcessValueLink extends Link {
  public constructor(id: string | null, driven?: boolean) {
    super(id, 'ProcessValueInterface', driven);
  }
}

export class TempSensorLink extends Link {
  public constructor(id: string | null, driven?: boolean) {
    super(id, 'TempSensorInterface', driven);
  }
}

export class SetpointSensorPairLink extends Link {
  public constructor(id: string | null, driven?: boolean) {
    super(id, 'SetpointSensorPairInterface', driven);
  }
}

export class ActuatorAnalogLink extends Link {
  public constructor(id: string | null, driven?: boolean) {
    super(id, 'ActuatorAnalogInterface', driven);
  }
}

export class ActuatorDigitalLink extends Link {
  public constructor(id: string | null, driven?: boolean) {
    super(id, 'ActuatorDigitalInterface', driven);
  }
}

export class BalancerLink extends Link {
  public constructor(id: string | null, driven?: boolean) {
    super(id, 'BalancerInterface', driven);
  }
}

export class MutexLink extends Link {
  public constructor(id: string | null, driven?: boolean) {
    super(id, 'MutexInterface', driven);
  }
}

export class DS2413Link extends Link {
  public constructor(id: string | null, driven?: boolean) {
    super(id, 'DS2413', driven);
  }
}

export class IoArrayLink extends Link {
  public constructor(id: string | null, driven?: boolean) {
    super(id, 'IoArrayInterface', driven);
  }
}
