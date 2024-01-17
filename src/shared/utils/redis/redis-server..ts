import { singleton } from "tsyringe";
import * as redis from "ioredis";

@singleton()
export class RedisServer {
  private readonly instance: redis.Redis;

  constructor() {
    this.instance = new redis.Redis({
      port: 6379,
      host: "localhost",
      db: 0,
    });
  }

  getInstance() {
    if (!this.instance) new RedisServer();

    return this.instance;
  }
}
