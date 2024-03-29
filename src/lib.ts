import type { SetOptional } from 'type-fest';
import { BigIntSerializer } from './buildin-serializer/BigInt.Serializer';
import { BufferSerializer } from './buildin-serializer/Buffer.Serializer';
import { DateSerializer } from './buildin-serializer/Date.Serializer';
import { ErrorSerializer } from './buildin-serializer/Error.Serializer';
import { FunctionSerializer } from './buildin-serializer/Function.Serializer';
import { MapSerializer } from './buildin-serializer/Map.Serializer';
import { NumberSerializer } from './buildin-serializer/Number.Serializer';
import { RegExpSerializer } from './buildin-serializer/RegExp.Serializer';
import { SetSerializer } from './buildin-serializer/Set.Serializer';
import { URLSerializer } from './buildin-serializer/URL.Serializer';
import { WrapRunnerSerializer } from './buildin-serializer/WrapRunner.Serializer';

export function simEval(code:string) {
  // eslint-disable-next-line no-new-func
  return new Function(`return ${code}`)();
}

function getIsNodejs() {
  return (typeof process !== 'undefined')
    && (Object.prototype.toString.call(process) === '[object process]')
    && (!!(process.versions && process.versions.node));
}
export const isNodeJs = getIsNodejs();

function getIsBrowser() {
  return (typeof window !== 'undefined')
    && (Object.prototype.toString.call(window) === '[object Window]')
    && (typeof window.alert === 'function')
    && (typeof window.console === 'object')
  ;
}
export const isBrowser = getIsBrowser();

export type ClassSpy<T extends object = object> = Function & { prototype: T };
export type InstanceTypeSpy<TClass> = InstanceType<{ new(): never } & TClass>;

export function getMarkKey(num: number, sp: string) {
  return sp + num.toString(36) + sp;
}
const NATIVE_TYPE = 'T';
const NATIVE_CONTENT = 'C';
const NATIVE_CLASSNAME = 'N';

export function getNativeKeys(sp: string, mark?: string) {
  const type = sp + NATIVE_TYPE + sp;
  const content = sp + NATIVE_CONTENT + sp;
  const className = sp + NATIVE_CLASSNAME + sp;
  const required = [ type, content ];
  const required_length = required.length + 1;
  const all = [ type, content, className ];
  const all_length = all.length + 1;
  if (mark !== undefined) {
    required.push(mark);
    all.push(mark);
  }
  return {
    sp,
    mark,
    type,
    content,
    className,
    required,
    required_length,
    all,
    all_length,
  };
}
export type NativeKeys = SetOptional<ReturnType<typeof getNativeKeys>, 'mark'>;
export function isNativeProperty(value: any, nativeKeys: NativeKeys): boolean {
  if (value === null || Array.isArray(value) || typeof (value) !== 'object') return false;
  const keys = Object.keys(value);
  if (nativeKeys.mark && value[nativeKeys.mark] !== 1) return false;
  if (keys.length > nativeKeys.all_length || keys.length < nativeKeys.required_length) return false;
  if (!nativeKeys.required.every(i => keys.includes(i))) return false;
  if (nativeKeys.mark && !keys.every(i => nativeKeys.all.includes(i))) return false;
  return true;
}
export function calMarkId(value: Record<string, any>, nativeKeys: NativeKeys, usedMark: string[]) {
  if (!isNativeProperty(value, nativeKeys)) return;
  const keys = Object.keys(value);
  const [ extraKey ] = keys.filter(i => !nativeKeys.all.includes(i));
  if (extraKey === undefined || value[extraKey] !== 1) return;
  usedMark.push(extraKey);
}

export type CustomerSerializer<T extends ClassSpy, TContent = any> = {
  className: string,
  class: T;
  toContent(value: InstanceTypeSpy<T>, isPlainContent: () => void): TContent;
  fromContent(content: TContent): InstanceTypeSpy<T>;
  isType(value: any): value is InstanceTypeSpy<T>;

  /**
   * when `TContent` is of `object` type, does it need to be serialized
   * @default true
   */
  serializContent?: boolean,
};

export type SerializeConfig = {
  Date: boolean,
  Function: boolean,
  RegExp: boolean,
  Set: boolean,
  Map: boolean,
  Buffer: boolean,
};

export function getBuildinSerializers(): CustomerSerializer<ClassSpy, any>[] {
  return [
    BigIntSerializer.getInstance(),
    NumberSerializer.getInstance(),
    FunctionSerializer.getInstance(),
    DateSerializer.getInstance(),
    BufferSerializer.getInstance(),
    URLSerializer.getInstance(),
    SetSerializer.getInstance(),
    MapSerializer.getInstance(),
    RegExpSerializer.getInstance(),
    ErrorSerializer.getInstance(),
    WrapRunnerSerializer.getInstance(),
  ];
}

export const customerSerializers: CustomerSerializer<ClassSpy, any>[] = [];
export function resetCustomerSerializers() {
  customerSerializers.splice(0);
  return customerSerializers;
}

export function createCustomerSerializer<T extends ClassSpy, TContent = any>(pars: SetOptional<CustomerSerializer<T, TContent>, 'className' | 'isType'>): CustomerSerializer<T, TContent> {
  return {
    className: pars.className ?? pars.class.name,
    class: pars.class,
    fromContent: pars.fromContent,
    toContent: pars.toContent,
    isType: pars.isType ?? ((clz: T) => {
      return (value: any):value is InstanceTypeSpy<T> => {
        return value instanceof clz;
      };
    })(pars.class),
    serializContent: pars.serializContent ?? true,
  };
}

export function addCustomerSerializer<T extends ClassSpy, TContent = any>(pars: SetOptional<CustomerSerializer<T, TContent>, 'className' | 'isType'>): void {
  const serializer = createCustomerSerializer(pars);
  const c = customerSerializers.find(i => i.className === serializer.className);
  if (c) {
    throw new Error(`duplicate serializer : ${c.className}`);
  }
  customerSerializers.push(serializer);
}
