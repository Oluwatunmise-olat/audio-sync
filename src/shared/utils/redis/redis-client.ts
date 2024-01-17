import * as redis from "ioredis";
import { injectable } from "tsyringe";

import { RedisServer } from "./redis-server.";

@injectable()
export class RedisClient {
  redisClient: redis.Redis;

  constructor(_redisServer: RedisServer) {
    this.redisClient = _redisServer.getInstance();
  }
}
