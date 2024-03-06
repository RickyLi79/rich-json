import { assert } from 'chai';
import RichJson from '../src';

describe('Stringify Options', () => {
  it('pretty', () => {
    const obj = { a: 1, b: 5, c: { d: true, e: false } };
    const pretty = 5;
    const expect = JSON.stringify(obj, null, pretty);
    const actual = RichJson.stringify(obj, { pretty }).replace(/\n {5}/g, '\n');
    assert.include(actual, expect);
  });
  it('excludKeys string', () => {
    const obj = { a: 1, b: 5, c: { d: true, e: false } };
    const expect = { a: 1, c: { d: true } };
    const actual = RichJson.clone(obj, { excludKeys: [ 'b', 'e' ] });
    assert.deepEqual(actual, expect);
  });
  it('excludKeys RegExp', () => {
    const obj = { a: 1, b: 5, c: { d: true, e: false } };
    const expect = { a: 1, c: { d: true } };
    const actual = RichJson.clone(obj, { excludKeys: /^b|e$/ });
    assert.deepEqual(actual, expect);
  });
  it('excludKeys mix', () => {
    const obj = { a: 1, b: 5, c: { d: true, e: false } };
    const expect = { c: { d: true } };
    const actual = RichJson.clone(obj, { excludKeys: [ 'a', /^b|e$/ ] });
    assert.deepEqual(actual, expect);
  });
});
