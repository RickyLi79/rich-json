import jsonpath from 'jsonpath';
import { type ClassSpy, type CustomerSerializer, type NativeKeys, getBuildinSerializers, getNativeKeys, isNativeProperty, isNodeJs, customerSerializers } from './lib';
type RichTypes = 'Number' | 'Function' | 'BigInt' | 'Buffer' | 'Class' | '$ref';
const refMap: Map<any, any> = new Map();

let buildinSerializers:CustomerSerializer<ClassSpy, any>[];

function getRichlValue(value: any, nativeKeys: NativeKeys): { type:RichTypes, className:string, content:any } {
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
    case 'Function':
      {
        let func: any;
        try {
          func = eval(`(${content})`);
        } catch (e) {
          const tmp = eval(`({${content}})`);
          func = tmp[Object.keys(tmp)[0]];
        }
        return func;
      }
      break;

    case 'BigInt':
      return BigInt(content);
      break;

    case 'Number':
      if (content === '-0') return -0;
      return Number[content];
      break;

    case '$ref':
      {
        let refObj = refMap.get(content);
        if (refObj === undefined) {
          const jp: string[] = JSON.parse(content);
          refObj = jsonpath.value(root, jsonpath.stringify(jp));
          if (refObj === undefined) {
            refObj = root;
            jp.shift();
            while (jp.length !== 0) {
              refObj = jsonpath.value(root, jsonpath.stringify([ '$', jp.shift() ]));
              if (refObj instanceof Map) {
                const v = jp.pop();
                const k = jp.pop();
                refObj = Array.from(refObj.entries())[k][v];
              } else if (refObj instanceof Set) {
                const i = jp.pop();
                refObj = Array.from(refObj)[i];
              }
            }
          }
          refMap.set(content, refObj);
        }
        return refObj;
      }
      break;

    case 'Buffer':
      {
        let buffer: any;
        if (className === 'Buffer') {
          if (isNodeJs) {
            buffer = Buffer.from(content);
          } else {
            buffer = new Uint8Array(content);
          }
        } else {
          buffer = new (eval(className) as any)(new TextEncoder().encode(content));
        }
        return buffer;
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

export function parse(text: string): any {
  
  buildinSerializers = getBuildinSerializers();
  try {
    if (text === undefined) return undefined;
    let wrap: {
      MARK: string,
      SP: string,
      root: any,
    };
    let nativeKeys:NativeKeys;
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
