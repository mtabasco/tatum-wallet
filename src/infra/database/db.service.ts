import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

const fs = require('fs');

const DB_FILE = 'db_data.json';
export type Data = {
  users: User[];
};

@Injectable()
export class DbService {
  private db: any;

  constructor() {
    let dbFile;
    try {
      dbFile = fs.readFileSync(DB_FILE);
    } catch (err) {
      this.db = {
        users: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db));
    }
    this.db = JSON.parse(dbFile);
  }

  public readUserById(id: string): User {
    return this.db['users'].find((user) => user.id === id);
  }

  public readUserByName(username: string): User {
    return this.db['users'].find((dbUser) => username === dbUser.name);
  }

  public saveUser(user: User) {
    this.db['users'].push(user);
    this.saveData();
  }

  public updateUserById(id: string, user: User) {
    const dbUser = this.readUserById(id);
    Object.assign(dbUser, user);
    this.saveData();
  }

  public deleteUserById(id: string) {
    this.db = this.db['users'].filter((user) => user.id !== id);
    this.saveData();
  }

  saveData = () => fs.writeFileSync(DB_FILE, JSON.stringify(this.db));
}
