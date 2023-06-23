import { MongoClient } from 'mongodb';

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
export default dbClient;
