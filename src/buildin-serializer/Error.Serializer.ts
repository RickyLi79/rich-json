import { createCustomerSerializer, simEval, type CustomerSerializer } from '../lib';


export class ErrorSerializer {
  private static instance: CustomerSerializer<typeof Error, [string, string]>;
  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = createCustomerSerializer({
        class: Error,
        toContent(value) {
          return [ value.name, value.message ];
        },
        fromContent([ name, message ]) {
          const err: Error = simEval(`new ${name}()`);
          err.message = message;
          return err;
        },
        serializContent: false,
      });
    }
    return this.instance;
  }
}
