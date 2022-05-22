import { Button, Grid, IconButton, ListItemIcon, Menu, MenuItem, TextField } from '@mui/material'
import { unflatten } from 'flat'
import type { NextPage, NextPageContext } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from '../styles/Room.module.scss'
import { client } from './api/_db'
import { Room, RoomUser } from './api/_types'
import { secureRoomInfo } from './api/_util'
import { TallyCounter } from '../components/Tally'
import useSWR from 'swr';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import UndoIcon from '@mui/icons-material/Undo';
import DoorBackIcon from '@mui/icons-material/DoorBack';
import { useModal } from 'mui-modal-provider'
import { ConfirmDialog, NameDialog, ShareDialog } from '../components/Dialogs'
import ShareIcon from '@mui/icons-material/Share';

const errorMaps = {
  'notfound': {
    title: 'Room not found',
    message: 'The room you are trying to join does not exist.',
  }
}

const fetcher = (...args: any[]) => (fetch as any)(...args).then((res: any) => res.json())

const localStorage: Storage = typeof window === 'undefined' ? {
  getItem: () => null,
} as any : window.localStorage;

const RoomPage: NextPage = ({
  room: roomProp
}: {
  room?: Room
}) => {
  const router = useRouter();
  const { showModal } = useModal();
  const { id: roomId } = router.query as Record<string, string>;
  const [ user, setUser ] = useState<RoomUser | null>(null);
  const [ room, setRoom ] = useState<Room | null>(roomProp ?? null);
  const [ errorId, setError ] = useState<keyof typeof errorMaps | null>(null);
  const error = useMemo(() => errorId ? errorMaps[errorId] ?? {
    title: 'Error',
    message: 'An unknown error occurred.',
  } : null, [ errorId ]);

  const [roomMenuAnchorEl, setRoomMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<RoomUser | null>(null);

  const { data, mutate } = useSWR(`/api/room?id=${roomId}`, fetcher, {
    refreshInterval: 1000,
  });
  useEffect(() => {
    if (data) {
      setRoom(data);
    }
  })

  useEffect(() => {
    (async () => {
      if (!room) {
        setError('notfound')
      }
    })()
  }, [ roomId ])
  useEffect(() => {
    if(room && !user && localStorage.getItem(roomId)) {
      const info = JSON.parse(localStorage.getItem(roomId) as any)
      const user = room.users[info[0]];
      setUser({
        ...user,
        editToken: info[1],
      });
    }
  }, [ ])

  const handleIncrease = useCallback(async (id: string) => {
    console.log(id)
    if (room && id) {
      const result = await fetch(`/api/drink?id=${room.id}&user=${id}&type=incr`, {
        method: 'PUT',
      })
      if (result.ok) {
        mutate(await result.json())
      }
    }
  }, [ room, user ]);

  const handleDecrease = useCallback(async (id: string) => {
    if (room && id) {
      const result = await fetch(`/api/drink?id=${room.id}&user=${id}&type=decr`, {
        method: 'PUT',
      })
      if (result.ok) {
        mutate(await result.json())
      }
    }
  }, [ room, user ]);

  const handleClickNewUser = useCallback(async () => {
    setRoomMenuAnchorEl(null);
    if (room) {
      showModal(NameDialog, {
        onConfirm: async (newUserName) => {
          if (newUserName) {
            console.log('add user %s', newUserName)
            const result = await fetch(`/api/drink?id=${room.id}&type=newuser&name=${encodeURIComponent(newUserName)}`, {
              method: 'PUT',
            })
            if (result.ok) {
              mutate(await result.json())
            }
          }
        }
      });
    }
  }, [ room ]);

  const handleLeaveRoom = useCallback(async () => {
    setRoomMenuAnchorEl(null);
    if (room) {
      showModal(ConfirmDialog, {
        onConfirm: async () => {
          router.push('/');
        },
        title: 'Leaving room',
        message: `Are you sure you want to leave ${room?.name}?`,
        reverseColors: true,
        noButtonText: 'Stay',
        yesButtonText: 'Leave',
      });
    }
  }, [ room ]);

  const handleShareRoom = useCallback(async () => {
    setRoomMenuAnchorEl(null);
    if (room) {
      showModal(ShareDialog, {
        room,
      });
    }
  }, [ room, selectedUser ]);

  const handleRemoveUser = useCallback(async () => {
    setUserMenuAnchorEl(null);
    setSelectedUser(null);
    if (room) {
      showModal(ConfirmDialog, {
        onConfirm: async () => {
          const result = await fetch(`/api/drink?id=${room.id}&type=removeuser&user=${selectedUser?.id}`, {
            method: 'PUT',
          })
          if (result.ok) {
            mutate(await result.json())
          }
        },
        title: 'Remove ' + selectedUser?.name,
        message: `Are you sure you want to kick ${selectedUser?.name} from ${room?.name}?`,
        reverseColors: true,
        noButtonText: 'Cancel',
        yesButtonText: 'Kick',
      });
    }
  }, [ room, selectedUser ]);

  return (
    <div className={styles.container}>
      <Head>
        <title>{room?.name ?? error?.title} - Beer Tally</title>
        <meta name="description" content="Very cool drink Counter Game Thing made by Xenomer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {error && <>
          <h1 className={styles.title}>
            { error?.title ?? 'Error' }
          </h1>
          <p className={styles.description}>
            { error?.message ?? 'An error happened' }
          </p>
        </> }
        { !error && room && <>
          <h1 className={styles.title}>
            { room.name }
            <IconButton
              onClick={e => setRoomMenuAnchorEl(e.currentTarget)}
            >
              <MoreVertIcon />
            </IconButton>
          </h1>
          <Grid container gap={4} sx={{
            margin: '2rem 0',
            width: '900px',
            maxWidth: '100%',
            // '& ': {

            // }
          }}>
            {
              Object.values(room.users).map(user => (
                <Grid container item xs={12} key={user.id}>
                  <Grid item xs={'auto'} key={user.id}>
                    <Button
                      onClick={() => handleIncrease(user.id)}
                      endIcon={'🍺'}
                      sx={{
                        color: 'white'
                      }}
                    >
                      {user.name}
                    </Button>
                  </Grid>
                  <Grid item xs key={user.id + 'c'} sx={{
                    fontSize: '0.6rem',
                    padding: '0.2rem 1rem',
                  }}>
                    <TallyCounter value={Number.parseInt(user.count as any as string)} showCount />
                  </Grid>
                  <Grid item xs={'auto'} key={user.id + 'i'}>
                  <IconButton
                    onClick={e => {
                      setUserMenuAnchorEl(e.currentTarget)
                      setSelectedUser(user)
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  </Grid>
                </Grid>
              ))
            }
          </Grid>
        </> }
      </main>
      {/* Room menu */}
      <Menu
        anchorEl={roomMenuAnchorEl}
        keepMounted
        open={Boolean(roomMenuAnchorEl)}
        onClose={() => setRoomMenuAnchorEl(null)}
      >
        <MenuItem
          onClick={handleShareRoom}
        >
          <ListItemIcon>
              <ShareIcon />
          </ListItemIcon>
          Share
        </MenuItem>
        <MenuItem
          onClick={handleClickNewUser}
        >
          <ListItemIcon>
              <PersonAddAltIcon />
          </ListItemIcon>
          Add user
        </MenuItem>
        <MenuItem
          onClick={handleLeaveRoom}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
              <LogoutIcon color='error' />
          </ListItemIcon>
          Leave room
        </MenuItem>
      </Menu>

      {/* User menu */}
      <Menu
        anchorEl={userMenuAnchorEl}
        keepMounted
        open={Boolean(userMenuAnchorEl)}
        onClose={() => setUserMenuAnchorEl(null)}
      >
        <MenuItem
          onClick={() => handleDecrease(selectedUser!.id)}
          disabled={(selectedUser?.count as any) === '0'}
        >
          <ListItemIcon>
              <UndoIcon />
          </ListItemIcon>
          Decrease drunkenness
        </MenuItem>
        <MenuItem
          onClick={handleRemoveUser}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
              <DoorBackIcon color='error' />
          </ListItemIcon>
          Kick user
        </MenuItem>
      </Menu>
    </div>
  )
}

export default RoomPage
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