import { execute } from './../lib/init';
import prompt from 'prompt';

import sinon from 'sinon';
import { expect } from 'chai';

describe('init', () => {
  let sandbox;
  let spy;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(prompt, 'start');
    spy = sandbox.spy(prompt, 'get');
    execute();
  });

  afterEach(() => sandbox.restore());

  it('should init', () => {
    console.log(spy.args[0][1]);
  });
  it('should fail', () => expect('1').to.equal('2'));
});
