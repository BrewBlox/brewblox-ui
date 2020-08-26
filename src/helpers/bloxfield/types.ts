export type {
  BloxField,
  Link,
  Quantity,
  BlockOrIntfType,
} from '@/plugins/spark/types';
import { BloxField } from '@/plugins/spark/types';

export interface JSBloxField extends BloxField {
  postfix: string;
  toJSON(): BloxField;
}
