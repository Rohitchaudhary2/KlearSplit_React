import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface CustomDialogProps {
    open: boolean;
    onClose: (value: boolean) => void;
    title: string;
    message: string;
}

const CustomDialog: React.FC<CustomDialogProps> = ({open, onClose, title, message}) => {
  const handleSubmit = () => {
    onClose(true);
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={() => onClose(false)}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          { title }
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(false)}>
            Close
          </Button>
          <Button onClick={handleSubmit}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CustomDialog
