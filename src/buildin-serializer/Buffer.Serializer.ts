import { type CustomerSerializer, createCustomerSerializer, isNodeJs } from '../lib';


export class BufferSerializer {
  private static instance:CustomerSerializer<typeof ArrayBuffer, [string, string]>;
  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = createCustomerSerializer({
        className: 'Buffer',
        class: ArrayBuffer,
        // @ts-ignore
        isType(value) {
          let isBuffer = false;
          if (isNodeJs) {
            if (value instanceof Buffer) {
              isBuffer = true;
            }
          }
      
          if (value instanceof ArrayBuffer || value?.buffer instanceof ArrayBuffer) {
            isBuffer = true;
          }
          return isBuffer;
        },
        toContent(value) {
          return [ value.valueOf().constructor.name, String.fromCharCode.apply(null, value.valueOf()) ];
        },
        fromContent([ className, content ]) {
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
        },
        serializContent: false,
      });
    }
    return this.instance;
  }
}
