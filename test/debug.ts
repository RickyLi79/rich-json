import { describe } from 'mocha';
import RichJson from '../src';

describe('RichJson', () => {

  it('debug', () => {
    const o = { a: 1 };
    const obj = { 
      g: new Set([ new Date(), 'g2', o ]), 
      o,
      reg: /123/gi,
      buffer: Buffer.from('hello'),
      buffer2: new Uint8Array([ 72, 101, 108, 108, 111 ]),
      a() { return 1; }, b: null, c: { d: 1n, e: null }, f: new Date(), 
      // y: null,
      z: { '#0#': 1, '#T#': 1, '#C#': 1 },
    };
    // obj.b = obj.c;
    // obj.c.e = obj;
    // obj.y = obj.z;
    const rJson = RichJson.stringify(obj, 2);
    console.info(rJson);

  });
});
