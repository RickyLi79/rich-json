import type { SetOptional } from 'type-fest';
import { DateSerializer } from './buildin-serializer/Date.Serializer';
import { SetSerializer } from './buildin-serializer/Set.Serializer';
import { MapSerializer } from './buildin-serializer/Map.Serializer';
import { RegExpSerializer } from './buildin-serializer/RegExp.Serializer';
import { WrapRunnerSerializer } from './buildin-serializer/WrapRunner.Serializer';
import { URLSerializer } from './buildin-serializer/URL.Serializer';
import { ErrorSerializer } from './buildin-serializer/Error.Serializer';

export const isBrowser = typeof window !== 'undefined';
export const isNodeJs = typeof process !== 'undefined';

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
export function calMarkId(value: object, nativeKeys: NativeKeys, usedMark: string[]) {
  if (!isNativeProperty(value, nativeKeys)) return;
  const keys = Object.keys(value);
  const [ extraKey ] = keys.filter(i => !nativeKeys.all.includes(i));
  if (extraKey === undefined || value[extraKey] !== 1) return;
  usedMark.push(extraKey);
}

export type CustomerSerializer<T extends ClassSpy, TContent = any> = {
  className: string,
  class: T;
  toContent(value: InstanceTypeSpy<T>): TContent;
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

const defaultSerializerInit: SerializeConfig = {
  Date: true,
  Function: true,
  RegExp: true,
  Set: true,
  Map: true,
  Buffer: true,
};

export const serializer: SerializeConfig = { ...defaultSerializerInit };


export function setSerializers(serializer: Partial<SerializeConfig>) {
  for (const i in serializer) {
    if (i in serializer) {
      serializer[i] = !!serializer[i];
    }
  }
  return serializer;
}

export function resetSerializer() {
  return setSerializers(defaultSerializerInit);
}

export function getBuildinSerializers(): CustomerSerializer<ClassSpy, any>[] {
  return [
    DateSerializer.getInstance(),
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
    isType: pars.isType ?? function(clz: T, value: any): value is T {
      return value instanceof clz;
    }.bind(null, pars.class),
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
