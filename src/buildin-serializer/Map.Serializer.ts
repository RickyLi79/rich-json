import { createCustomerSerializer, type CustomerSerializer } from '../lib';


export class MapSerializer {
  private static instance:CustomerSerializer<typeof Map, unknown[]>;
  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = createCustomerSerializer({
        class: Map,
        toContent(value) {
          return Array.from(value.entries());
        },
        fromContent(content) {
          const map = new Map();
          (content as [unknown, unknown][]).forEach(([ key, value ]) => map.set(key, value));
          return map;
        },
        serializContent: true,
      });
    }
    return this.instance;
  }
}
