import chai from 'chai';
import redis from 'redis';

const { assert } = chai;
let client;

describe('redis client integration', () => {
  // eslint-disable-next-line
  beforeEach(function(done) {
    // Create a new instance of redisClient before each test
    client = redis.createClient();
    // Start the IO server if needed
    // Connect two IO clients if needed
    done();
  });

  // eslint-disable-next-line
  afterEach(function(done) {
    // Disconnect and clean up the redisClient after each test
    client.quit();
    // Disconnect IO clients if connected
    done();
  });

  // eslint-disable-next-line
  it('should return the right value', async () => {
    const reply = await new Promise((resolve) => {
      client.get('wrongKey', (err, reply) => {
        resolve(reply);
      });
    });

    assert.equal(reply, null);
  });

  // eslint-disable-next-line
  it('should return the right value after setting a new value', async () => {
    const reply = await new Promise((resolve) => {
      client.set('userName', 'wordHeart', (err, reply) => {
        resolve(reply);
      });
    });

    assert.equal(reply, 'OK');
  });

  // eslint-disable-next-line
  it('should return the right value after getting a value', async () => {
    const reply = await new Promise((resolve) => {
      client.get('userName', (err, reply) => {
        resolve(reply);
      });
    });

    assert.equal(reply, 'wordHeart');
  });

  // eslint-disable-next-line
  it('should delete a key', async () => {
    const reply = await new Promise((resolve) => {
      client.del('userName', (err, reply) => {
        resolve(reply);
      });
    });

    assert.equal(reply, 1);
  });

  // eslint-disable-next-line
  it('should return the right value after deleting key', async () => {
    const reply = await new Promise((resolve) => {
      client.get('userName', (err, reply) => {
        resolve(reply);
      });
    });

    assert.equal(reply, null);
  });
});
