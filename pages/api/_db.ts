import { createClient } from "redis";

export const client = createClient({
  url: 'redis://192.168.0.204:6379'
});