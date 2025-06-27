import {forwardRef} from "react";
import ReactJson from "react-json-view";
import { Box, Typography } from "@mui/material";

import { Button, ModalWrapper } from "@atoms";
import {useModal} from "@context";
import { VoteReceipt, Proof } from "@services";

type TextModalState = {
  title: string;
  response: VoteReceipt | VoteReceipt[];
  proofs?: Proof[];
}

export const TextModal = forwardRef<HTMLDivElement>((_, ref) => {
  const { state, closeModal } = useModal<TextModalState>();

  return (
    <ModalWrapper
      dataTestId={ "voting-modal"}
      hideCloseButton={true}
      ref={ref}
      sx={{ padding: '32px 40px', minWidth: '800px' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <Typography variant="h1">{state?.title}</Typography>
        <Box sx={{ overflowY: 'scroll', maxHeight: state?.proofs ? '28vh' : '64vh' }}>
          {state && <ReactJson src={state.response} style={{ wordBreak: "break-word" }} />}
        </Box>
        {state?.proofs && (
          <Box sx={{ paddingTop: '16px' }}>
            <Typography variant="body2" sx={{ paddingBottom: '16px' }}>Vote proofs</Typography>
            <Box sx={{ overflowY: 'scroll', maxHeight: '28vh' }}>
              <ReactJson src={state.proofs} style={{ wordBreak: "break-word" }} />
            </Box>
          </Box>
        )}
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
