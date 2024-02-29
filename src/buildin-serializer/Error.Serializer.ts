import { type CustomerSerializer, createCustomerSerializer } from '../lib';


export class ErrorSerializer {
  private static instance:CustomerSerializer<typeof Error, {name:string, message:string}>;
  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = createCustomerSerializer({
        class: Error,
        toContent(value) {
          return {
            name: value.name,
            message: value.message,
          };
        },
        fromContent(content) {
          const err:Error = eval(`new ${content.name}()`);
          err.message = content.message;
          return err;
        },
        serializContent: false,
      });
    }
    return this.instance;
  }
}
