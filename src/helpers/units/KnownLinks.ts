import Link from './Link';

export class ProcessValueLink extends Link {
  constructor(id: string | null) {
    super(id, 'ProcessValueInterface');
  }
}

export class TempSensorLink extends Link {
  constructor(id: string | null) {
    super(id, 'TempSensorInterface');
  }
}

export class SetpointLink extends Link {
  constructor(id: string | null) {
    super(id, 'SetpointInterface');
  }
}

export class SetpointSensorPairLink extends Link {
  constructor(id: string | null) {
    super(id, 'SetpointSensorPairInterface');
  }
}

export class ActuatorAnalogLink extends Link {
  constructor(id: string | null) {
    super(id, 'ActuatorAnalogInterface');
  }
}

export class ActuatorDigitalLink extends Link {
  constructor(id: string | null) {
    super(id, 'ActuatorDigitalInterface');
  }
}

export class BalancerLink extends Link {
  constructor(id: string | null) {
    super(id, 'BalancerInterface');
  }
}

export class MutexLink extends Link {
  constructor(id: string | null) {
    super(id, 'MutexInterface');
  }
}
