import { Button, TextField } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from '../styles/Create.module.scss'

const Create: NextPage = () => {
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')

  const createRoom = useCallback(async () => {
    console.log('creating room %s as %s', room, name)
    try {
      const result = await fetch('/api/create', {
        method: 'POST',
        body: JSON.stringify({ name, room }),
        headers: [
          ['Content-Type', 'application/json'],
        ]
      });
      const roomData = await result.json() as import('./api/create').Data;
      const userData = Object.values(roomData.users)[0];
      console.log('room: %o', roomData)
      localStorage.setItem(roomData.id, JSON.stringify([ userData.id, userData.editToken ]))
      window.location.href = `/room?id=${roomData.id}`
    } catch {
      console.error('error creating room, rip')
    }
  }, [name, room]);
  const isValid = useMemo(() => 
    !!name
    && !!room
  , [ name, room ]);
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Room - Beer Tally</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Create a new room
        </h1>

        <div className={styles.list}>
            <TextField
                className={styles.list_item}
                label="Room name"
                onChange={e => setRoom(e.target.value)}
            />
            <TextField
                className={styles.list_item}
                label="Your name"
                onChange={e => setName(e.target.value)}
            />
            <Button
                variant='contained'
                className={styles.list_button}
                disabled={!isValid}
                onClick={createRoom}
            >Create</Button>
        </div>
      </main>
    </div>
  )
}

export default Create
