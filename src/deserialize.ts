import jsonpath from 'jsonpath';
import { customerSerializers, getBuildinSerializers, getNativeKeys, isNativeProperty, type ClassSpy, type CustomerSerializer, type NativeKeys } from './lib';
type RichTypes = 'Class' | '$ref';
const refMap: Map<any, any> = new Map();

let buildinSerializers: CustomerSerializer<ClassSpy, any>[];

function getRichlValue(value: any, nativeKeys: NativeKeys): { type: RichTypes, className: string, content: any } {
  return {
    type: value[nativeKeys.type],
    className: value[nativeKeys.className],
    content: value[nativeKeys.content],
  };
}

function fromRich(value: any, root: any, nativeKeys: NativeKeys): any {
  if (!isNativeProperty(value, nativeKeys)) return value;
  const { type, content, className } = getRichlValue(value, nativeKeys);
  switch (type) {

    case '$ref':
      {
        const contentStr = JSON.stringify(content);
        let refObj = refMap.get(contentStr);
        if (refObj === undefined) {
          const jp: string[] = [ ...content ];
          refObj = jsonpath.value(root, jsonpath.stringify(jp));
          if (refObj === undefined) {
            refObj = root;
            jp.shift();
            while (jp.length !== 0) {
              refObj = jsonpath.value(refObj, jsonpath.stringify([ '$', jp.shift()! ]));
              if (refObj instanceof Map) {
                const v = jp.pop() as any as number;
                const k = jp.pop() as any as number;
                refObj = Array.from(refObj.entries())[k][v];
              } else if (refObj instanceof Set) {
                const i = jp.pop() as any as number;
                refObj = Array.from(refObj)[i];
              }
            }
          }
          refMap.set(contentStr, refObj);
        }
        return refObj;
      }
      break;

    case 'Class':
      {
        let converter = customerSerializers.find(i => i.className === className);
        if (!converter) {
          converter = buildinSerializers.find(i => i.className === className);
        }
        if (converter) {
          return converter.fromContent(content);
        }
      }
      break;

    default:
      { const n: never = type; }
      break;
  }
  return value;
}

export function parse<T>(text: string): T {

  buildinSerializers = getBuildinSerializers();
  try {
    if (text === undefined) return undefined!;
    let wrap: {
      MARK: string,
      SP: string,
      root: any,
    };
    let nativeKeys: NativeKeys;
    refMap.clear();
    const re = JSON.parse(text, function(this: any, key, value) {
      if (wrap === undefined) {
        wrap = this;
        nativeKeys = getNativeKeys(wrap.SP, wrap.MARK);
        return value;
      }
      return fromRich(value, wrap.root, nativeKeys);
    });
    if (typeof re !== 'object' || re === null) return re;
    return re.root;
  } finally {
    refMap.clear();
  }
}
