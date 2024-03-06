import { stringify, type StringifyOptions } from './serialize';
import { parse } from './deserialize';
import { addCustomerSerializer, resetCustomerSerializers, isNodeJs, isBrowser } from './lib';
import { WrapRunner } from './buildin-serializer/WrapRunner.Serializer';

const clone = function <T>(obj: T, options?:StringifyOptions): T {
  const text = stringify(obj, options);
  const actual = parse<T>(text);
  return actual;
};

export const RichJson = {
  stringify,
  parse,
  clone,
  addCustomerSerializer,
  resetCustomerSerializers,
  isNodeJs,
  isBrowser,
  WrapRunner,
};
export default RichJson;
