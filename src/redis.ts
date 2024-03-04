import Redis from "ioredis";

interface RedisModuleParams {
  host?: string;
  port?: number;
  password?: string;
}

export class RedisModule {
  redis: Redis;
  constructor({ host, port, password }: RedisModuleParams) {
    this.redis = new Redis({
      host,
      port,
      password,
    });
  }

  /** Redis 연결 확인 */
  ping() {
    this.redis.ping((err, result) => {
      if (result) {
        console.log("Connected to Redis:", result);
        return;
      }
      if (err) {
        console.error("Failed to connect to Redis:", err);
      }
    });
  }
  /**  Redis에 데이터 저장 */
  save(key: string, value: any) {
    this.redis
      .hset(key, value)
      .then(() => {
        console.log("Data stored successfully.");
      })
      .catch((err) => {
        console.error("Failed to store data:", err);
      });
  }

  async get(key: string) {
    try {
      const data = await this.redis.get(key);
      return data;
    } catch (e) {
      console.error("Failed to retrieve value:", e);
    }
  }
  quit() {
    this.redis.quit();
  }
}
