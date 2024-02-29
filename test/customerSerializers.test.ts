import { describe } from 'mocha';
import RichJson from '../src';
import { assert } from 'chai';
import { resetCustomerSerializers } from '../src/lib';


describe('customerSerializers', () => {
  class MyClass {
    data: string;
    private constructor(data: string = 'my class') { this.data = data; }
    public static create(data?: string) {
      return new MyClass(data);
    }
    toJSON() {
      return 1;
    }
  }
  const obj = {
    key1: 1,
    key2: {
      key1: 2,
    },
    3: {
      key1: 1,
      key2: 2,
    },
    key4: 4,
    key5: MyClass.create('1313'),
  };

  beforeEach(() => {
    resetCustomerSerializers();
  });
  it('base', () => {
    RichJson.addCustomerSerializer({
      className: 'abc',
      class: MyClass,
      toContent: value => ({ abc: value.data }),
      fromContent: json => {
        return MyClass.create(json.abc);
      },
    });
    const acutal = RichJson.clone(obj);
    const expect = obj;
    assert.deepEqual(acutal, expect);
    assert.instanceOf(acutal.key5, MyClass);
  });
  it('toJSON SHOULD NOT change after convert', () => {
    let counter = 0;
    class Clz {
      data: number = 0;
      toJSON() {
        return counter++;
      }
    }
    const inst = new Clz();
    inst.data = 5;
    const stage1 = JSON.stringify(inst);
    assert.equal(counter, 1);
    assert.equal('0', stage1);

    RichJson.addCustomerSerializer({
      class: Clz,
      toContent: value => value.data,
      fromContent: json => { const inst = new Clz(); inst.data = json; return inst; },
    });
    const inst2 = RichJson.clone(inst);
    assert.equal(inst2.data, inst.data);
    assert.notEqual(inst2.data, 0);
    assert.equal(counter, 1);

    const stage2 = JSON.stringify(inst);
    assert.equal(counter, 2);
    assert.equal('1', stage2);
  });
  it('SHOULD NOT add duplicate converter', () => {
    class Clz {
    }
    assert.doesNotThrow(() => {
      RichJson.addCustomerSerializer({
        class: Clz,
        fromContent: null,
        toContent: null,
      });
    });
    assert.Throw(() => {
      RichJson.addCustomerSerializer({
        class: Clz,
        fromContent: null,
        toContent: null,
      });
    });
    assert.Throw(() => {
      RichJson.addCustomerSerializer({
        className: 'Clz',
        class: null,
        fromContent: null,
        toContent: null,
      });
    });
    assert.doesNotThrow(() => {
      RichJson.addCustomerSerializer({
        className: 'Clz2',
        class: Clz,
        fromContent: null,
        toContent: null,
      });
    });
  });
});
