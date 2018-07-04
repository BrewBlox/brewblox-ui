import SVGStraight from './tube_straight.svg';
import SVGInput from './tube_input.svg';
import SVGOutput from './tube_output.svg';
import SVGElbow from './tube_elbow.svg';
import SVGTee from './tube_tee.svg';

import Part from '../Part';

export class Straight extends Part {
  partRender = (createElement: Function) => createElement(SVGStraight);
}

export class Input extends Part {
  partRender = (createElement: Function) => {
    return createElement(SVGInput);
  }
}

export class Output extends Part {
  partRender = (createElement: Function) => {
    return createElement(SVGOutput);
  }
}

export class Elbow extends Part {
  partRender = (createElement: Function) => {
    return createElement(SVGElbow);
  }
}

export class Tee extends Part {
  partRender = (createElement: Function) => {
    return createElement(SVGTee);
  }
}
