import { Button, TextField } from '@mui/material'
import { unflatten } from 'flat'
import type { NextPage, NextPageContext } from 'next'
import Head from 'next/head'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from '../styles/Create.module.scss'
import { client } from './api/_db'
import { Room } from './api/_types'
import { secureRoomInfo } from './api/_util'

const Join: NextPage = ({
    room: roomProp
}: {
    room?: Room
}) => {
  const [name, setName] = useState('')
  const [roomId, setRoom] = useState(roomProp?.id ?? '')

  const joinRoom = useCallback(async () => {
    console.log('joining room %s as %s', roomId, name)
    try {
      const result = await fetch('/api/join', {
        method: 'POST',
        body: JSON.stringify({ name, id: roomId }),
        headers: [
          ['Content-Type', 'application/json'],
        ]
      });
      const roomData = await result.json() as import('./api/join').Data;
      console.log('room: %o', roomData)
      const userData = roomData.users[roomData.userId];
      localStorage.setItem(roomData.id, JSON.stringify([ userData.id, userData.editToken ]))
      window.location.href = `/room?id=${roomData.id}`
    } catch {
      console.error('error joining room, rip')
    }
  }, [ name, roomId ]);
  const isValid = useMemo(() => 
    !!name
    && !!roomId
  , [ name, roomId ]);
  return (
    <div className={styles.container}>
      <Head>
        <title>Join Room - Beer Tally</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Join { roomProp ? roomProp.name : 'a room' }
        </h1>

        <div className={styles.list}>
            { !roomProp && <TextField
                className={styles.list_item}
                label="Room code"
                onChange={e => setRoom(e.target.value)}
            /> }
            <TextField
                className={styles.list_item}
                label="Your name"
                onChange={e => setName(e.target.value)}
            />
            <Button
                variant='contained'
                className={styles.list_button}
                disabled={!isValid}
                onClick={joinRoom}
            >Join</Button>
        </div>
      </main>
    </div>
  )
}

export default Join

export async function getServerSideProps(context: NextPageContext) {
    const id = context.query.id as string;
  
    if (id) {
      if (!client.isOpen) {
        await client.connect()
      }
      if (await client.exists(id)) {
        const room = secureRoomInfo(unflatten(await client.hGetAll(id)));
        if (room) {
          return {
            props: {
              room
            }
          }
        }
      }
    }
    return {
      props: {
        room: null
      }
    }
  }