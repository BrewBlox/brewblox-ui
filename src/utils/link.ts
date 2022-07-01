import { BlockOrIntfType, Link } from '@/shared-types';

import { prettyLink } from './formatting';
import { isLink } from './identity';

export function rawLink(
  id: string | null,
  type?: BlockOrIntfType | null,
  driven?: boolean,
): Link;
export function rawLink(other: Link): Link;
export function rawLink(
  value: Link | string | null,
  type?: BlockOrIntfType | null,
  driven?: boolean,
): Link {
  return isLink(value)
    ? {
        __bloxtype: 'Link',
        id: value.id ?? null,
        type: value.type ?? null,
        driven: value.driven,
      }
    : {
        __bloxtype: 'Link',
        id: value,
        type: type ?? null,
        driven,
      };
}

export class JSLink implements Link {
  public readonly __bloxtype = 'Link';
  public id: string | null;
  public type: BlockOrIntfType | null;
  public driven: boolean;

  public constructor(
    id?: string | null,
    type?: BlockOrIntfType | null,
    driven?: boolean,
  );
  public constructor(other: Link);
  public constructor(
    value?: Link | string | null,
    type?: BlockOrIntfType | null,
    driven?: boolean,
  ) {
    const obj = rawLink(value as any, type as any, driven as any);
    this.id = obj.id ?? null;
    this.type = obj.type as BlockOrIntfType;
    this.driven = obj.driven ?? false;
  }

  public get postfix(): string {
    const typeStr = this.type ?? '';
    const drivenStr = this.driven ? ',driven' : '';
    return `<${typeStr}${drivenStr}>`;
  }

  public toString(): string {
    return prettyLink(this);
  }

  public toJSON(): Link {
    return {
      __bloxtype: 'Link',
      id: this.id,
      type: this.type,
      driven: this.driven || undefined,
    };
  }

  public copy(): JSLink {
    return new JSLink(this);
  }

  public eq(other: Link): boolean {
    // Type does not have to be equal
    return (
      isLink(other) && this.id === other.id && !!this.driven === !!other.driven
    );
  }

  public withId(id: string | null): JSLink {
    this.id = id;
    return this;
  }
}

/**
 * Create a Link object.
 *
 * Links are used to indicate relations between blocks,
 * and consist of an ID + type/interface.
 *
 * The following input types are supported:
 * - Raw arguments: `bloxLink('temp-sensor-1', BlockType.TempSensorOneWire)`
 * - Another Quantity object: `bloxLink(bloxLink('temp-sensor-1'))`
 *
 * https://brewblox.netlify.app/dev/decisions/20200723_typed_fields.html
 *
 */
export function bloxLink(
  id: string | null,
  type?: BlockOrIntfType | null,
  driven?: boolean,
): JSLink;
export function bloxLink(other?: Link): JSLink;
export function bloxLink(
  value?: Link | string | null,
  type?: BlockOrIntfType | null,
  driven?: boolean,
): JSLink {
  return new JSLink(value as any, type, driven);
}
