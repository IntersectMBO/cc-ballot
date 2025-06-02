import {forwardRef} from "react";

import { ModalWrapper } from "@atoms";
import { Button } from "@atoms";
import { Box, Typography } from "@mui/material";
import {useModal} from "@context";

type TextModalState = {
  title: string;
   text: string;
}

export const TextModal = forwardRef<HTMLDivElement>((_, ref) => {
  const { state, closeModal } = useModal<TextModalState>();

  return (
    <ModalWrapper
      dataTestId={ "voting-modal"}
      hideCloseButton={true}
      ref={ref}
      sx={{ padding: '32px 40px' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <Typography variant="h1">{state?.title}</Typography>
        <Typography variant="body1">
          {state?.text}
        </Typography>
      </Box>
      <Box sx={{ paddingTop: '24px' }}>
        <Button
          variant="outlined"
          onClick={closeModal}
        >
          Cancel
        </Button>
      </Box>
    </ModalWrapper>
  )
});
