import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Sinon from 'sinon';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import mime from 'mime-types';
import fs from 'fs';
import Bull from 'bull';
import { promisify } from 'util';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';



chai.use(chaiHttp);

// const testUser = {
//   email: `${uuidv4()}@email.com`,
//   password: `${uuidv4()}`,
// };

const testFile1 = {
  name: 'testFile.txt',
  type: 'file',
  // parentId: '649811a32fe4123f5d817dec',
  // isPublic: false,
  data: 'SGVsbG8gV2Vic3RhY2shCg==',
};

const testFile2 = {
  name: 'testFile2.txt',
  type: 'file',
  data: 'SGVsbG8gV2Vic3RhY2shCg==',
};

const testFile3 = {
  type: 'file',
  data: 'SGVsbG8gV2Vic3RhY2shCg==',
};

const testFile4 = {
  name: 'testFile.txt',
  data: 'SGVsbG8gV2Vic3RhY2shCg==',
};

const testFile5 = {
  name: 'testFile.txt',
  type: 'wrongType' || '',
  data: 'SGVsbG8gV2Vic3RhY2shCg==',
};

describe('tests for all endpoints', () => {
  const testUser = {
    email: 'david@email.com',
    password: '123456',
  };
  describe('method: GET, /status', () => {
    // eslint-disable-next-line
    it('should return the status of the server', async () => {
      const response = await chai.request(app).get('/status');
      expect(response).to.have.status(200);
      expect(response.body).to.deep.equal({ redis: true, db: true });
    });
  });

  describe('method: GET, /stats', () => {
    // eslint-disable-next-line
    it.skip('should return the stats in the database', async () => {
      const response = await chai.request(app).get('/stats');
      expect(response).to.have.status(200);
      expect(response.body).to.deep.equal({
        users: 6,
        files: 6,
      });
    });
  });

  describe('method: POST, /users', () => {
    // eslint-disable-next-line
    it.skip('should create a new user', async () => {
      const response = await chai.request(app).post('/users').send(testUser);
      expect(response).to.have.status(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('email');
      expect(response.body).to.not.have.property('password');
      expect(response.body.email).to.be.equal(testUser.email);
    });

    // eslint-disable-next-line
    it('should return a 400 if email is missing', async () => {
      const response = await chai.request(app).post('/users').send({ password: testUser.password });
      expect(response).to.have.status(400);
      expect(response.body).to.deep.equal({ error: 'Missing email' });
    });

    // eslint-disable-next-line
    it('should return a 400 if password is missing', async () => {
      const response = await chai.request(app).post('/users').send({ email: testUser.email });
      expect(response).to.have.status(400);
      expect(response.body).to.deep.equal({ error: 'Missing password' });
    });

    // eslint-disable-next-line
    it('should return a 400 if email already exist', async () => {
      const response = await chai.request(app).post('/users').send(testUser);
      expect(response).to.have.status(400);
      expect(response.body).to.deep.equal({ error: 'Already exist' });
    });
  });

  describe('method: GET, /connect', () => {
    // eslint-disable-next-line
    it('should return a token if the user is connected', async () => {
      const response = await chai.request(app).get('/connect').auth(testUser.email, testUser.password);
      expect(response).to.have.status(200);
      expect(response.body).to.deep.equal({ token: response.body.token });
    });

    // eslint-disable-next-line
    it('should return a 401 if the user is not connected', async () => {
      const response = await chai.request(app).get('/connect').auth(testUser.email, 'wrongPassword');
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });

    // eslint-disable-next-line
    it('should return a 401 if the user does not exist', async () => {
      const response = await chai.request(app).get('/connect').auth('wrongEmail', 'wrongPassword');
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });

    // eslint-disable-next-line
    it('should return a 401 if the email is missing', async () => {
      const response = await chai.request(app).get('/connect').auth('', testUser.password);
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });

    // eslint-disable-next-line
    it('should return a 401 if the password is missing', async () => {
      const response = await chai.request(app).get('/connect').auth(testUser.email, '');
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });

    // eslint-disable-next-line
    it('should return a 401 if the email is wrong', async () => {
      const response = await chai.request(app).get('/connect').auth('wrongEmail', testUser.password);
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });

    // eslint-disable-next-line
    it('should return a 401 if header is missing', async () => {
      const response = await chai.request(app).get('/connect');
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });

      const response2 = await chai.request(app).get('/connect').set('Authorization', '');
      expect(response2).to.have.status(401);
      expect(response2.body).to.deep.equal({ error: 'Unauthorized' });
    });

    // eslint-disable-next-line
    it('should return a 401 if header is wrong', async () => {
      const response = await chai.request(app).get('/connect').set('Authorization', 'wrongToken');
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });
  });

  describe('method: GET, /disconnect', () => {
    // eslint-disable-next-line
    it('should signout the user based on token', async () => {
      const tokenResponse = await chai.request(app).get('/connect').auth(testUser.email, testUser.password);
      expect(tokenResponse).to.have.status(200);
      const { token } = tokenResponse.body;
      const spy = Sinon.spy(console, 'log');
      console.log(token);
      const response = await chai.request(app).get('/disconnect').set('X-Token', token);
      expect(response).to.have.status(204);
      spy.restore();
    });

    // eslint-disable-next-line
    it('should return a 401 if the token is missing', async () => {
      const response = await chai.request(app).get('/disconnect').set('X-Token', '');
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });

    // eslint-disable-next-line
    it('should return a 401 if the token is wrong', async () => {
      const response = await chai.request(app).get('/disconnect').set('X-Token', 'wrongToken');
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });

    // eslint-disable-next-line
    it('should return a 401 if the token is not in the database', async () => {
      const response = await chai.request(app).get('/disconnect').set('X-Token', 'wrongToken');
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });
  });

  describe('method: GET, /users/me', () => {
    // eslint-disable-next-line
    it('should return the user based on token', async () => {
      const tokenResponse = await chai.request(app).get('/connect').auth(testUser.email, testUser.password);
      expect(tokenResponse).to.have.status(200);
      const { token } = tokenResponse.body;
      const response = await chai.request(app).get('/users/me').set('X-Token', token);
      expect(response).to.have.status(200);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('email');
      expect(response.body).to.not.have.property('password');
      expect(response.body.email).to.be.equal(testUser.email);
    });

    // eslint-disable-next-line
    it('should return a 401 if the token is missing', async () => {
      const response = await chai.request(app).get('/users/me').set('X-Token', '');
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });

    // eslint-disable-next-line
    it('should return a 401 if the token is wrong', async () => {
      const response = await chai.request(app).get('/users/me').set('X-Token', 'wrongToken');
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });

    // eslint-disable-next-line
    it('should return a 401 if the token is not in the database', async () => {
      const response = await chai.request(app).get('/users/me').set('X-Token', 'wrongToken');
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });

    // eslint-disable-next-line
    it('should return a 401 if the user does not exist', async () => {
      const response = await chai.request(app).get('/users/me').set('X-Token', 'wrongToken');
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });

    // eslint-disable-next-line
    it('should return a 401 if the user is not connected', async () => {
      const response = await chai.request(app).get('/users/me').set('X-Token', 'wrongToken');
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });
  });

  describe('method: POST, /files', () => {
    // eslint-disable-next-line
    it('should return a 401 if the user is not connected', async () => {
      const response = await chai.request(app).post('/files').send(testFile2);
      expect(response).to.have.status(401);
      expect(response.body).to.deep.equal({ error: 'Unauthorized' });
    });
    // eslint-disable-next-line
    it('should create a new file', async () => {
      const tokenResponse = await chai.request(app).get('/connect').auth(testUser.email, testUser.password);
      expect(tokenResponse).to.have.status(200);
      const { token } = tokenResponse.body;
      // we need to add content-type of application/json to the header
      const response = await chai.request(app).post('/files').set(['X-Token', token], ['Content-Type', 'application/json']).send(testFile1);
      expect(response).to.have.status(201);
    });
    // eslint-disable-next-line
    it('should return a 400 if the name is missing', async () => {
      const tokenResponse = await chai.request(app).get('/connect').auth(testUser.email, testUser.password);
      expect(tokenResponse).to.have.status(200);
      const { token } = tokenResponse.body;
      const response = (await chai.request(app).post('/files').set('X-Token', token).send(testFile3));

      expect(response).to.have.status(400);
      expect(response.body).to.deep.equal({ error: 'Missing name' });
    });

    // eslint-disable-next-line
    it('should return a 400 if the type is missing', async () => {
      const tokenResponse = await chai.request(app).get('/connect').auth(testUser.email, testUser.password);
      expect(tokenResponse).to.have.status(200);
      const { token } = tokenResponse.body;
      const response = await chai.request(app).post('/files').set('X-Token', token).send(testFile4 || testFile5);
      expect(response).to.have.status(400);
      expect(response.body).to.deep.equal({ error: 'Missing type' });
    });
  });
});
