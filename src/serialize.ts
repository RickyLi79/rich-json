import { type ClassSpy, type InstanceTypeSpy, type CustomerSerializer, serializer, isNodeJs, customerSerializers, getNativeKeys, calMarkId, getMarkKey, type NativeKeys, getBuildinSerializers } from './lib';

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
let nativeKeys:NativeKeys;
let usedMark:string[];
let buildinSerializers:CustomerSerializer<ClassSpy, any>[];

type RichTypes = 'Number' | 'Function' | 'BigInt' | 'Buffer' | 'Class' | '$ref';
function createRichValue<Type extends RichTypes, Content = any>(s: RichJson<Type, Content>): any {
  if (typeof s.content === 'object') {
    if (s.serializContent) {
      s.content[MARK] = s.raw;
    } else {
      s.content[IGNORE] = s.raw;
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

function toRichFunc(value: (...args: any[]) => any) {
  const c = value.toString();
  return createRichValue({
    raw: value,
    type: 'Function',
    content: c,
  });
}

const NumberStaticsKeys = [ 'EPSILON', 'MAX_SAFE_INTEGER', 'MAX_VALUE', 'MIN_SAFE_INTEGER', 'MIN_VALUE', 'NEGATIVE_INFINITY', 'POSITIVE_INFINITY' ]; 
function toRichNumber(value: number) {
  if (Number.isNaN(value)) {
    return createRichValue({
      raw: value,
      type: 'Number',
      content: 'NaN',
    });
  }
  if (Object.is(value, -0)) {
    return createRichValue({
      raw: value,
      type: 'Number',
      content: '-0',
    });
  }
  for (const i of NumberStaticsKeys) {
    const n:number = Number[i];
    if (value === n) {
      return createRichValue({
        raw: value,
        type: 'Number',
        content: i,
      });
    }
  }
  return value;
}
function toRichBigint(value: bigint) {
  return createRichValue({
    raw: value,
    type: 'BigInt',
    content: value.toString(),
  });
}
function toRichBuffer(value: ArrayBuffer | Uint8Array) {
  const __class__ = value.constructor.name;
  return createRichValue({
    raw: value,
    type: 'Buffer',
    className: __class__,
    content: String.fromCharCode.apply(null, value),
  });
}
function toRichRef(ref: string[]) {
  return createRichValue({
    raw: undefined,
    type: '$ref',
    content: JSON.stringify(ref),
  });
}

function toRichClass<T extends ClassSpy>(value: InstanceTypeSpy<T>, serializer: CustomerSerializer<T>) {
  const className = serializer.className;
  const content = serializer.toContent(value);
  return createRichValue({
    raw: value,
    className,
    type: 'Class',
    content,
    serializContent: serializer.serializContent,
  });
}

function nativeReplacer(this: any, key: string, value: any, map: Map<any, string[]>, fullpath: string[]): any {
  const type = typeof (value);
  if (value === Object(value)) map.set(value, fullpath);
  if (type === 'function' && serializer.Function) {
    return toRichFunc(value);
  } else if (type === 'number') {
    return toRichNumber(value);
  } else if (type === 'bigint') {
    return toRichBigint(value);
  } else if (type === 'object' && type !== null) {
    if (serializer.Buffer) {
      let isBuffer = false;
      if (isNodeJs) {
        if (value instanceof Buffer) {
          isBuffer = true;
        }
      }

      if (value instanceof ArrayBuffer || value?.buffer instanceof ArrayBuffer) {
        isBuffer = true;
      }
      if (isBuffer) {
        return toRichBuffer(value);
      }
    }
    calMarkId(value, nativeKeys, usedMark);
    for (const i in customerSerializers) {
      const iConverter = customerSerializers[i];
      if (iConverter.isType(value)) {
        return toRichClass(value, iConverter);
      }
    }
    for (const i in buildinSerializers) {
      const iConverter = buildinSerializers[i];
      if (iConverter.isType(value)) {
        return toRichClass(value, iConverter);
      }
    }
  }
  return value;
}

export function stringify(value: any, pretty?: string | number): string {
  const root = value;
  const map: Map<any, string[]> = new Map();
  const toJsonMap: Map<{ prototype: { toJSON: any } }, any> = new Map();
  NATIVE_MARK = Math.random() + '-MARK-' + Date.now();
  const SP = '#';
  nativeKeys = getNativeKeys(SP);
  usedMark = [];
  try {
    // initConfig();
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
    // map.set(root, [ '$' ]);
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
      let fullpath: string[];
      const hasMark = isNativeProperty(this);
      if (Object.is(value, root)) {
        fullpath = [ '$' ];
      } else if (!hasMark && !this[IGNORE]) {
        const parentJp = map.get(this[MARK] ?? this);
        fullpath = [ ...parentJp, key ];
      }
      if (!hasMark && map.has(value)) {
        return toRichRef(map.get(value));
      }
      return nativeReplacer.call(this, key, value, map, fullpath);
    }, pretty);

    for (const [ clazz, toJSON ] of toJsonMap.entries()) {
      clazz.prototype.toJSON = toJSON;
    }
    let nextMarkId = 0;
    let markKey:string;
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
