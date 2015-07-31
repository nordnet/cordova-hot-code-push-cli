import prompt from 'prompt';

import sinon from 'sinon';
import { expect } from 'chai';

import { execute } from './../src/init';

const withBucket = {
  name: 'name',
  s3region: 'us-east-1',
  s3bucket: 'bucket',
  ios_identifier: 'ios',
  android_identifier: 'android',
  update: 'resume',
};

const contentUrl = {
  content_url: 'http://url',
};

const expectedContentWithBucket = {
  name: 'name',
  s3region: 'us-east-1',
  s3bucket: 'bucket',
  ios_identifier: 'ios',
  android_identifier: 'android',
  update: 'resume',
  content_url: 'https://s3.amazonaws.com/bucket',
};

describe('init', () => {
  let sandbox;
  let get;

  beforeEach(() => sandbox = sinon.sandbox.create());
  afterEach(() => sandbox.restore());

  describe('when bucket is set', () => {
    beforeEach(() => {
      get = sandbox.stub(prompt, 'get', stubPromptGet(withBucket));
      execute();
    });

    it('should call prompt.get once', () => expect(get.calledOnce).to.be.true);

    // TODO stub fs.writeFile and verify contents
  });
});

function stubPromptGet(result) {
  return function(props, callback) {
    if (props.properties && props.properties.s3region) {
      callback(null, result);
    } else if (props.properties && props.properties.content_url) {
      callback(null, contentUrl);
    }
  }
}
