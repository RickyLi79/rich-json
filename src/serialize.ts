import { calMarkId, customerSerializers, getBuildinSerializers, getMarkKey, getNativeKeys, isNodeJs, type ClassSpy, type CustomerSerializer, type InstanceTypeSpy, type NativeKeys } from './lib';

type RichJson<Type extends RichTypes, Content = any> = {
  raw: any,
  type: Type,
  className?: string,
  content: Content,

  /**
   * when `TContent` is of `object` type, does it need to be serialized
   * @default true
   */
  serializContent?: boolean,
};

const MARK = Symbol('mark');
const IGNORE = Symbol('ignore');

let NATIVE_MARK: string;
let nativeKeys: NativeKeys;
let usedMark: string[];
let buildinSerializers: CustomerSerializer<ClassSpy, any>[];

type RichTypes = 'Class' | '$ref';

function createRichValue<Type extends RichTypes, Content = any>(s: RichJson<Type, Content>): any {
  if (s.content !== null && typeof s.content === 'object') {
    if (s.serializContent) {
      (s.content as Record<symbol, any>)[MARK] = s.raw;
    } else {
      (s.content as Record<symbol, any>)[IGNORE] = s.raw;
    }
  }
  return {
    [MARK]: MARK,
    [NATIVE_MARK]: 1,
    [nativeKeys.type]: s.type,
    [nativeKeys.className]: s.className,
    [nativeKeys.content]: s.content,
  };
}

function isNativeProperty(value: any): boolean {
  return typeof value === 'object' && value?.[MARK] === MARK;
}

function toRichRef(ref: string[]) {
  return createRichValue({
    raw: undefined,
    type: '$ref',
    content: ref,
    serializContent: false,
  });
}

function toRichClass<T extends ClassSpy>(value: InstanceTypeSpy<T>, serializer: CustomerSerializer<T>) {
  const className = serializer.className;
  let isPlainContent = false;
  const content = serializer.toContent(value, () => {
    isPlainContent = true;
  });
  if (isPlainContent) {
    return content;
  }
  return createRichValue({
    raw: value,
    className,
    type: 'Class',
    content,
    serializContent: serializer.serializContent,
  });
}

function nativeReplacer(this: any, key: string, value: any, map: Map<any, string[]>, fullpath: string[]): any {
  if (value === null || value === undefined || typeof value === 'string') return value;
  const boxedValue = Object(value);
  if (value === boxedValue) map.set(value, fullpath);
  calMarkId(value, nativeKeys, usedMark);
  for (const i in customerSerializers) {
    const iConverter = customerSerializers[i];
    if (iConverter.isType(value)) {
      return toRichClass(value, iConverter);
    }
  }
  for (const i in buildinSerializers) {
    const iConverter = buildinSerializers[i];
    if (iConverter.isType(boxedValue)) {
      return toRichClass(boxedValue, iConverter);
    }
  }
  return value;
}

type Arrayable<T> = T | T[];
export type StringifyOptions = {
  pretty?: string | number,
  // stable?: boolean,
  excludKeys?: Arrayable<string | RegExp>;
};

export function stringify(value: any, options?: StringifyOptions): string {
  const { pretty, excludKeys = [] } = options ?? {};
  const _excludKeys: (string | RegExp)[] = Array.isArray(excludKeys) ? excludKeys : [ excludKeys ];
  const root = value;
  const map: Map<any, string[]> = new Map();
  const toJsonMap: Map<{ prototype: { toJSON: any } }, any> = new Map();
  NATIVE_MARK = '-MARK-' + Math.random() + Date.now() + Math.random();
  const SP = '#';
  nativeKeys = getNativeKeys(SP);
  usedMark = [];
  try {
    buildinSerializers = getBuildinSerializers();
    buildinSerializers.forEach(iSerializer => {
      toJsonMap.set(iSerializer.class, iSerializer.class.prototype.toJSON);
      iSerializer.class.prototype.toJSON = function(this) {
        return this as any;
      };
    });

    if (isNodeJs) {
      toJsonMap.set(Buffer, Buffer.prototype.toJSON);
      Buffer.prototype.toJSON = function(this) {
        return this as any;
      };
    }

    customerSerializers.forEach(iSerializer => {
      if (!toJsonMap.has(iSerializer.class)) {
        toJsonMap.set(iSerializer.class, iSerializer.class.prototype.toJSON);
      }
      iSerializer.class.prototype.toJSON = function(this) {
        return this as any;
      };
    });
    const wrap = {
      [MARK]: MARK,
      MARK: NATIVE_MARK,
      SP,
      root,
    };
    let re = JSON.stringify(wrap, function(this: any, key: string, value: any) {
      if (value === wrap) return value;
      const include = this[MARK] ?? true;
      if (!include) return;
      if (value === undefined) return;
      if (_excludKeys.some(i => {
        if (i instanceof RegExp) {
          return i.test(key);
        }
        return i === key;
      })) {
        return;
      }
      if (value === null || typeof value === 'string') return value;
      
      let fullpath: string[];
      const hasMark = isNativeProperty(this);
      if (Object.is(value, root)) {
        fullpath = [ '$' ];
      } else if (!hasMark && !this[IGNORE]) {
        const parentJp = map.get(this[MARK] ?? this)!;
        fullpath = [ ...parentJp, key ];
      }
      if (!hasMark && map.has(value)) {
        return toRichRef(map.get(value)!);
      }
      return nativeReplacer.call(this, key, value, map, fullpath!);
    }, pretty);

    for (const [ clazz, toJSON ] of toJsonMap.entries()) {
      clazz.prototype.toJSON = toJSON;
    }
    let nextMarkId = 0;
    let markKey: string;
    do {
      markKey = getMarkKey(nextMarkId++, nativeKeys.sp);
    } while (usedMark.includes(markKey));
    re = re.replace(new RegExp('"' + NATIVE_MARK + '"', 'g'), '"' + markKey + '"');
    return re;
  } finally {
    usedMark = [];
    toJsonMap.clear();
    map.clear();
  }
}
