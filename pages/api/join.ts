import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'redis';
import { Room } from './_types';
import { client } from './_db';
import { nanoid } from 'nanoid';
import { flatten, unflatten } from 'flat';
import { secureRoomInfo } from './_util';

export type Data = Room & {
    userId: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    if (!client.isOpen) {
      await client.connect()
    }
    const { name: userName = '', id: roomId = '' } = req.body;
    if (!userName || !roomId) {
      return res.status(400).end();
    } else if (!await client.exists(roomId)) {
        return res.status(404).end();
    } else {
      const userId = nanoid(10);
      const room: Room = unflatten(await client.hGetAll(roomId));
      room.users[userId] = {
        id: userId,
        name: userName,
        editToken: nanoid(),
        count: 0,
      }
      await client.hSet(room.id, flatten(room) as any);
      const securedRoom = secureRoomInfo(room);
      securedRoom.users[userId].editToken = room.users[userId].editToken;
      console.log(await client.hGetAll(room.id))
      res.status(200).json({
        ...securedRoom,
        userId,
      })
    }
  } else {
    res.status(405).end();
  }
}
