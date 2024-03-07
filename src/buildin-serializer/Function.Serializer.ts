/* eslint-disable no-eval */
import { createCustomerSerializer, type CustomerSerializer } from '../lib';


export class FunctionSerializer {
  private static instance:CustomerSerializer<typeof Function, string>;
  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = createCustomerSerializer({
        class: Function,
        toContent(value) {
          return value.toString();
        },
        fromContent(content) {
          let func: any;
          try {
            func = eval(`(${content})`);
          } catch (e) {
            const tmp = eval(`({${content}})`);
            func = tmp[Object.keys(tmp)[0]];
          }
          return func;
        },
        serializContent: false,
      });
    }
    return this.instance;
  }
}
