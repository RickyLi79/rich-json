import { type CustomerSerializer, createCustomerSerializer } from '../lib';


export class RegExpSerializer {
  private static instance:CustomerSerializer<typeof RegExp, [string, string]>;
  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = createCustomerSerializer({
        class: RegExp,
        toContent(value) {
          return [ value.source, value.flags ];
        },
        fromContent([ source, flags ]) {
          return new RegExp(source, flags);
        },
        serializContent: false,
      });
    }
    return this.instance;
  }
}
