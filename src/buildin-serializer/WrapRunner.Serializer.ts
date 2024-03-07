import { createCustomerSerializer, type CustomerSerializer } from '../lib';
type ThisOfFunc<T extends (...args: any) => any> = T extends (this: infer THIS, ...args: any[]) => any ? THIS : never;
export class WrapRunner<Func extends (...args: any) => any> {

  public args: Parameters<Func>;

  constructor(public func: Func, ...args: Parameters<Func>) {
    this.args = args;
  }

  run<Return extends ReturnType<Func>>(THIS: ThisOfFunc<Func> | null = null): Return {
    return this.func.apply(THIS, this.args);
  }

}

export class WrapRunnerSerializer {
  private static instance: CustomerSerializer<typeof WrapRunner, [(...args: any) => any, any[]]>;
  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = createCustomerSerializer({
        className: 'rich-json#WrapRunner',
        class: WrapRunner,
        toContent(value) {
          return [ value.func, value.args ];
        },
        fromContent(content) {
          return new WrapRunner(content[0], ...content[1]);
        },
        serializContent: true,
      });
    }
    return this.instance;
  }
}
