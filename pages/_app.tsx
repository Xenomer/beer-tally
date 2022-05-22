import '../styles/globals.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import type { AppProps } from 'next/app'
import { Card, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import ModalProvider from 'mui-modal-provider';
import { green } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: green[400],
    },
  },
})

function MyApp({ Component, pageProps }: AppProps) {
  return <ThemeProvider theme={theme}>
    <CssBaseline />
    <ModalProvider>
      <Component {...pageProps} />
    </ModalProvider>
  </ThemeProvider>
}

export default MyApp
