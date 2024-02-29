import { type CustomerSerializer, createCustomerSerializer } from '../lib';


export class SetSerializer {
  private static instance:CustomerSerializer<typeof Set, unknown[]>;
  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = createCustomerSerializer({
        class: Set,
        toContent(value) {
          return Array.from(value);
        },
        fromContent(contwnt) {
          return new Set(contwnt);
        },
        serializContent: true,
      });
    }
    return this.instance;
  }
}
