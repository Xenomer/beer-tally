import { flatten, unflatten } from 'flat';
import { nanoid } from 'nanoid';
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'redis';
import { client } from './_db';
import { Room } from './_types';
import { ROOM_EXPIRE_TIMEOUT, secureRoomInfo } from './_util';


export type Data = Room

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'PUT') {
    if (!client.isOpen) {
      await client.connect()
    }
    const query = req.query as Record<string, string>;

    const { id: roomId = '', type = 'incr' } = query;
    if (!roomId) {
      return res.status(400).end();
    } else if (!await client.exists(roomId)) {
      return res.status(401).end();
    } else if (type === 'incr') {
      const { user: userId } = query;
      await client
        .multi()
        .hIncrBy(roomId, `users.${userId}.count`, 1)
        .expire(roomId, ROOM_EXPIRE_TIMEOUT)
        .exec()
    } else if (type === 'decr') {
      const { user: userId } = query;
      const count = await client.hGet(roomId, `users.${userId}.count`);

      // makes sure the count can't go below 0
      if (count && Number.parseInt(count) > 0) {
        await client
          .multi()
          .hIncrBy(roomId, `users.${userId}.count`, -1)
          .expire(roomId, ROOM_EXPIRE_TIMEOUT)
          .exec()
      }
    } else if (type === 'newuser') {
      const { name } = query;
      const userId = nanoid(10);
      await client
        .multi()
        .hSet(roomId, flatten({
          users: {
            [userId]: {
              id: userId,
              name,
              count: 0,
            }
          }
        } as Partial<Room>) as any)
        .expire(roomId, ROOM_EXPIRE_TIMEOUT)
        .exec();
    } else if (type === 'removeuser') {
      const { user: userId } = query;
      await client
        .multi()
        .hDel(roomId, `users.${userId}.id`)
        .hDel(roomId, `users.${userId}.name`)
        .hDel(roomId, `users.${userId}.count`)
        .hDel(roomId, `users.${userId}.editToken`)
        .expire(roomId, ROOM_EXPIRE_TIMEOUT)
        .exec();
    }

    const room = secureRoomInfo(unflatten(await client.hGetAll(roomId)));
    res.status(200).json(room as any)
  } else {
    res.status(405).end();
  }
}
