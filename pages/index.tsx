import { Box, Link } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { TallyCounter } from '../components/Tally'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const router = useRouter();
  return (
    <div className={styles.container}>
      <Head>
        <title>Beer Tally</title>
        <meta name="description" content="Very cool beer tally thing, made by Xenomer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          🍺Beer Tally🍺
        </h1>

        <p className={styles.description}>
          Start tallying your drunkenness! <br/>
        </p>
        <Box component='span' sx={{
          mb: 4,
          fontSize: '1.3em',
        }}>
          <TallyCounter
            value={15}
          />
        </Box>

        <div className={styles.grid}>
          <Link href='/create' onClick={(e) => { e.preventDefault(); router.push('/create')}} className={styles.card} sx={{
            '&:hover,&:focus,&:active': {
              color: theme => theme.palette.primary.main,
              borderColor: theme => theme.palette.primary.main,
            }
          }}>
            <h2>Create Room &rarr;</h2>
            <p>Start keeping track of your drinking!</p>
          </Link>

          <Link href='/join' onClick={(e) => { e.preventDefault(); router.push('/join')}} className={styles.card} sx={{
            '&:hover,&:focus,&:active': {
              color: theme => theme.palette.primary.main,
              borderColor: theme => theme.palette.primary.main,
            }
          }}>
            <h2>Join Room &rarr;</h2>
            <p>Join a friend's drinking session!</p>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Home
