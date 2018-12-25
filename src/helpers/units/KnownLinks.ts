import Link from './Link';

export class ProcessValueLink extends Link {
  constructor(id: string | null) {
    super(id, 'ProcessValueLink');
  }
}

export class TempSensorLink extends Link {
  constructor(id: string | null) {
    super(id, 'TempSensorLink');
  }
}

export class SetpointLink extends Link {
  constructor(id: string | null) {
    super(id, 'SetpointLink');
  }
}

export class SetpointSensorPairLink extends Link {
  constructor(id: string | null) {
    super(id, 'SetpointSensorPairLink');
  }
}

export class ActuatorAnalogLink extends Link {
  constructor(id: string | null) {
    super(id, 'ActuatorAnalogLink');
  }
}

export class ActuatorDigitalLink extends Link {
  constructor(id: string | null) {
    super(id, 'ActuatorDigitalLink');
  }
}

export class BalancerLink extends Link {
  constructor(id: string | null) {
    super(id, 'BalancerLink');
  }
}

export class MutexLink extends Link {
  constructor(id: string | null) {
    super(id, 'MutexLink');
  }
}

export class DS2413Link extends Link {
  constructor(id: string | null) {
    super(id, 'DS2413');
  }
}
