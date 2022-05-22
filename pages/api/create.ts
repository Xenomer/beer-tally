import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'redis';
import { Room } from './_types';
import { client } from './_db';
import { nanoid } from 'nanoid';
import { flatten } from 'flat';
import { ROOM_EXPIRE_TIMEOUT } from './_util';

export type Data = Room

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    if (!client.isOpen) {
      await client.connect()
    }
    const { name: userName = '', room: roomName = '' } = req.body;
    if (!userName || !roomName) {
      return res.status(400).end();
    } else {
      const userId = nanoid(10);
      const room: Room = {
        id: nanoid(8),
        name: roomName,
        users: {
          [userId]: {
            id: userId,
            name: userName,
            editToken: nanoid(),
            count: 0,
          }
        }
      }
      await client.multi()
        .hSet(room.id, flatten(room) as any)
        .expire(room.id, ROOM_EXPIRE_TIMEOUT)
        .exec()
      console.log('created:', await client.hGetAll(room.id))
      res.status(200).json(room as any)
    }
  } else {
    res.status(405).end();
  }
}
