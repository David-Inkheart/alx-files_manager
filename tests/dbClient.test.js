import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { MongoClient } from 'mongodb';

chai.use(chaiHttp);

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const db = process.env.DB_DATABASE || 'files_manager';
    const port = process.env.DB_PORT || 27017;
    const url = `mongodb://${host}:${port}`;
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
      if (err) {
        console.log(err.message);
        this.db = false;
      } else {
        this.db = client.db(db);
      }
    });
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }

  async findUser(user) {
    return this.db.collection('users').findOne(user);
  }

  async createUser(user) {
    return this.db.collection('users').insertOne(user);
  }

  async updateUser(query, update) {
    return this.db.collection('users').updateOne(query, update);
  }

  async findFile(file) {
    return this.db.collection('files').findOne(file);
  }

  async createFile(file) {
    return this.db.collection('files').insertOne(file);
  }

  async aggregateFiles(query) {
    return this.db.collection('files').aggregate(query).toArray();
  }

  async updateFile(query, update) {
    return this.db.collection('files').updateOne(query, update);
  }
}

const dbClient = new DBClient();

describe('tests for dbClient', () => {
  describe('isAlive', () => {
    // eslint-disable-next-line
    it('should return true if db is alive', () => {
      expect(dbClient.isAlive()).to.equal(true);
    });
  });

  describe('number of Users', () => {
    // eslint-disable-next-line
    it('should return the number of users in the DB', async () => {
      const nbUsers = await dbClient.nbUsers();
      expect(nbUsers).to.equal(4); // 4 users in the DB
    });
  });

  describe('number of files', () => {
    // eslint-disable-next-line
    it('should return the number of files in the DB', async () => {
      const nbFiles = await dbClient.nbFiles();
      expect(nbFiles).to.equal(6); // 6 files in the DB
    });
  });

  describe('find a non-existent user', () => {
    // eslint-disable-next-line
    it('should return the right user', async () => {
      const user = await dbClient.findUser({
        email: 'dave@email',
      });
      expect(user).to.equal(null);
    });
  });
});
