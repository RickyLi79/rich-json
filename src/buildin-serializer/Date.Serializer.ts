import { type CustomerSerializer, createCustomerSerializer } from '../lib';


export class DateSerializer {
  private static instance:CustomerSerializer<typeof Date, string>;
  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = createCustomerSerializer({
        class: Date,
        toContent(value) {
          return value.toISOString();
        },
        fromContent(content) {
          return new Date(content);
        },
        serializContent: false,
      });
    }
    return this.instance;
  }
}
