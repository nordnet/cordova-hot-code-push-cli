import { writeFile } from './../src/utils';
import fs from 'fs';


describe('writeFile', () => {
  let sandbox, stub;

  beforeEach(() => sandbox = sinon.sandbox.create());
  afterEach(() => sandbox.restore());


  beforeEach(MockPromise.replace);
  afterEach(MockPromise.restore);

  beforeEach(() => {
    stub = sandbox.stub(fs, 'writeFile', (filename, data, cb) => cb())
  });

  it('uses the fs.writeFile function once', () => {
    writeFile('bla.bar', 'stuff').then(() => expect(stub).to.have.been.calledOnce);
  });

  it('calls fs.write with stringified JSON argument', () => {
    writeFile('bla.bar', {foo:42}).then(() => {
      var filenameArg = stub.args[0][0];
      var contentArg = JSON.parse(stub.args[0][1]);
      expect(filenameArg).to.equal('bla.bar');
      expect(contentArg).to.eql({foo:42})
    });
  });


});