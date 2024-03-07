import { createCustomerSerializer, type CustomerSerializer } from '../lib';

const NumberStaticsKeys: (keyof NumberConstructor)[] = [ 'EPSILON', 'MAX_SAFE_INTEGER', 'MAX_VALUE', 'MIN_SAFE_INTEGER', 'MIN_VALUE', 'NEGATIVE_INFINITY', 'POSITIVE_INFINITY' ];
export class NumberSerializer {
  private static instance: CustomerSerializer<typeof Number, keyof NumberConstructor | '-0' | number>;
  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = createCustomerSerializer({
        class: Number,
        toContent(value, isPlainContent) {
          const v = value.valueOf();
          if (Number.isNaN(v)) {
            return 'NaN';
          }
          if (Object.is(v, -0)) {
            return '-0';
          }
          for (const i of NumberStaticsKeys) {
            const n = Number[i];
            if (v === n) {
              return i;
            }
          }
          isPlainContent();
          return v;
        },
        fromContent(content) {
          if (content === '-0') return -0;
          return Number[content as any as keyof NumberConstructor] as any;
        },
        serializContent: false,
      });

    }
    return this.instance;
  }
}
