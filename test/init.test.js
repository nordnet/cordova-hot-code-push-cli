import prompt from 'prompt';
import fs from 'fs';
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
  content_url: 'https://s3.amazonaws.com/bucket'
};

describe('init', () => {
  let sandbox;
  let get;
  let writeFile;

  beforeEach(() => sandbox = sinon.sandbox.create());
  afterEach(() => sandbox.restore());

  describe('when bucket is set', () => {
    beforeEach(() => {
      get = sandbox.stub(prompt, 'get', stubPromptGet(withBucket));
      writeFile = sandbox.stub(fs, 'writeFile', (filename, data, cb) => cb());
      execute();
    });

    it('should call prompt.get once', () => expect(get.calledOnce).to.be.true);

    it('should write to file once', () => expect(writeFile).to.have.been.calledOnce);

    it('should write to correct file name', () => expect(writeFile).have.been.calledWith(sinon.match((val)=> val.match(/cordova-hcp\.json$/)), sinon.match.any, sinon.match.func));

    it('should write to correct file content', () => {
      var expectedContent = {
        "name": "name",
        "s3region": "us-east-1",
        "s3bucket": "bucket",
        "ios_identifier": "ios",
        "android_identifier": "android",
        "update": "resume",
        "content_url": "https://s3.amazonaws.com/bucket"
      };

      var content = JSON.parse(writeFile.args[0][1]);
      expect(content).to.eql(expectedContent)
    });
  });
});

function stubPromptGet(result) {
  return function (props, callback) {
    if (props.properties && props.properties.s3region) {
      callback(null, result);
    } else if (props.properties && props.properties.content_url) {
      callback(null, contentUrl);
    }
  };
}
