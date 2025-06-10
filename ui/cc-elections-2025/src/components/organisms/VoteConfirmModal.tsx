import { forwardRef } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useModal } from "@context";
import { ModalWrapper } from "@atoms";

type VoteConfirmModalState = {
  onConfirm: () => void;
}

export const VoteConfirmModal = forwardRef<HTMLDivElement>((_, ref) => {
  const { state, closeModal } = useModal<VoteConfirmModalState>();

  return (
    <ModalWrapper
      dataTestId="vote-confirm"
      hideCloseButton={true}
      ref={ref}
      sx={{ padding: '32px 24px' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <Typography variant="h1">Are you sure you are ready to confirm your vote?</Typography>
        <Typography variant="body1">
          Once your preference is submitted it can't be changed
        </Typography>
      </Box>
      <Box sx={{ padding: '16px 0 0', display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={closeModal}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={state?.onConfirm}
        >
          Yes, I want to confirm my vote
        </Button>
      </Box>
    </ModalWrapper>
  )
});
