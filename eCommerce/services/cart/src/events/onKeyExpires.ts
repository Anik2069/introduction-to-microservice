import { Redis } from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "@/config";
import { channel } from "diagnostics_channel";

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

const CHANNEL_KEY = "__keyevent@0__:expired"; //redis definced channel for expired keys

redis.config("SET", "notify-keyspace-events", "Ex"); //

redis.subscribe(CHANNEL_KEY);

redis.on("message", async (channel, message) => {
  console.log(channel, message);
  if (channel === CHANNEL_KEY) {
    const cartSessionId = message.split(":")[1];
    console.log("Cart session expired:", cartSessionId);
  }
});
export default redis;
