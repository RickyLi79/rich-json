import { type CustomerSerializer, createCustomerSerializer } from '../lib';


export class BigIntSerializer {
  private static instance:CustomerSerializer<typeof BigInt, string>;
  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = createCustomerSerializer<typeof BigInt, string>({
        class: BigInt,
        toContent(value:BigInt) {
          return value.toString();
        },
        fromContent(content) {
          return BigInt(content) as never;
        },
        serializContent: false,
      });
    }
    return this.instance;
  }
}
