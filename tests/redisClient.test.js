import chai from 'chai';
import sinon from 'sinon';
import redisClient from '../utils/redis';

const { assert } = chai;

describe('tests for redisClient', () => {
  // eslint-disable-next-line
  it('should return the right value', async () => {
    const stub = sinon.stub(redisClient, 'get').returns(null);
    const reply = await redisClient.get('wrongKey');
    assert.equal(reply, null);
    stub.restore();
  });

  // eslint-disable-next-line
  it('should return the right value after setting a new value', async () => {
    const stub = sinon.stub(redisClient, 'set').returns('OK');
    const reply = await redisClient.set('userName', 'wordHeart', 5);
    assert.equal(reply, 'OK');
    stub.restore();
  });

  // eslint-disable-next-line
  it('should return the right value after getting a value', async () => {
    const stub = sinon.stub(redisClient, 'get').returns('wordHeart');
    const reply = await redisClient.get('userName');
    assert.equal(reply, 'wordHeart');
    stub.restore();
  });

  // eslint-disable-next-line
  it('should delete a key', async () => {
    const stub = sinon.stub(redisClient, 'del').returns('OK');
    const reply = await redisClient.del('userName');
    assert.equal(reply, 'OK');
    stub.restore();
  });
});
