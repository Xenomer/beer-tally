import { Box, Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Room } from "../pages/api/_types";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

type PromptDialogProps<T> = DialogProps & {
  onConfirm: (value: T) => void
}
type ConfirmDialogProps = DialogProps & {
  onConfirm: () => void
  noButtonText?: string
  yesButtonText?: string
  title: string
  message: string
  reverseColors?: boolean
}
type ShareDialogProps = DialogProps & {
  room: Room
}

export function NameDialog({
  onConfirm,
  ...props
}: PromptDialogProps<string>) {
  const [value, setValue] = useState('');

  return <Dialog maxWidth='xs' fullWidth {...props as any}>
    <DialogTitle>
      <Typography variant="h6">
        Enter user name
      </Typography>
    </DialogTitle>
    <DialogContent sx={{ paddingTop: '1rem !important' }}>
      <TextField label='user name' fullWidth defaultValue={value} onChange={e => setValue(e.target.value)} />
    </DialogContent>
    <DialogActions>
      <Box display='flex' width='100%' gap={1} margin={1}>
        <Button sx={{ flex: 1 }} onClick={props.onClose as any} variant='outlined' color='error'>Cancel</Button>
        <Button
          sx={{ flex: 1 }}
          disabled={!value}
          onClick={() => {
            onConfirm(value);
            (props as any).onClose();
          }}
          variant='contained'
        >Add</Button>
      </Box>
    </DialogActions>
  </Dialog>
}

export function ConfirmDialog({
  onConfirm,
  noButtonText = 'Cancel',
  yesButtonText = 'Confirm',
  title,
  message,
  reverseColors = false,
  ...props
}: ConfirmDialogProps) {
  return <Dialog maxWidth='xs' fullWidth {...props as any}>
    <DialogTitle>
      <Typography variant="h6">
        { title }
      </Typography>
    </DialogTitle>
    <DialogContent sx={{ paddingTop: '1rem !important' }}>
      { message }
    </DialogContent>
    <DialogActions>
      <Box display='flex' width='100%' gap={1} margin={1}>
        <Button
          sx={{ flex: 1 }}
          onClick={() => {
            (props as any).onClose();
          }}
          variant={'outlined'}
          color={reverseColors ? 'primary' : 'error'}
        >{ noButtonText }</Button>
        <Button
          sx={{ flex: 1 }}
          onClick={() => {
            onConfirm();
            (props as any).onClose();
          }}
          variant={'contained'}
          color={reverseColors ? 'error' : 'primary'}
        >{ yesButtonText }</Button>
      </Box>
    </DialogActions>
  </Dialog>
}

export function ShareDialog({
  room,
  ...props
}: ShareDialogProps) {
  return <Dialog maxWidth='xs' fullWidth {...props as any}>
    <DialogTitle>
      <Typography variant="h6">
        Share room
      </Typography>
    </DialogTitle>
    <DialogContent sx={{ paddingTop: '1rem !important' }}>
      <Button
        endIcon={<ContentCopyIcon />}
      >
        Copy link
      </Button>
    </DialogContent>
    <DialogActions>
      <Button
        // sx={{ flex: 1 }}
        onClick={() => {
          (props as any).onClose();
        }}
        variant={'text'}
        // color={''}
      >Close</Button>
    </DialogActions>
  </Dialog>
}