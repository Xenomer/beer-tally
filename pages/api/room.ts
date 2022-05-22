import { unflatten } from 'flat';
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'redis';
import { client } from './_db';
import { Room } from './_types';
import { secureRoomInfo } from './_util';

export type Data = Room

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    if (!client.isOpen) {
      await client.connect()
    }
    const { id: roomId = '' } = req.query as Record<string, string>;
    if (!roomId) {
      return res.status(400).end();
    } else {
      const room = secureRoomInfo(unflatten(await client.hGetAll(roomId)));
      res.status(200).json(room as any)
    }
  } else {
    res.status(405).end();
  }
}
