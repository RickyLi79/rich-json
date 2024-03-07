import { WrapRunner } from './buildin-serializer/WrapRunner.Serializer';
import { parse } from './deserialize';
import { addCustomerSerializer, isBrowser, isNodeJs, resetCustomerSerializers } from './lib';
import { stringify, type StringifyOptions } from './serialize';

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
