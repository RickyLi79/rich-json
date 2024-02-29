import { type CustomerSerializer, createCustomerSerializer } from '../lib';


export class URLSerializer {
  private static instance:CustomerSerializer<typeof URL, string>;
  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = createCustomerSerializer({
        class: URL,
        toContent(value) {
          return value.toString();
        },
        fromContent(content) {
          return new URL(content);
        },
        serializContent: false,
      });
    }
    return this.instance;
  }
}
