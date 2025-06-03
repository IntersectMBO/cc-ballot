import {forwardRef} from "react";
import { CopyBlock, dracula } from "react-code-blocks";

import { ModalWrapper } from "@atoms";
import { Button } from "@atoms";
import { Box, Typography } from "@mui/material";
import {useModal} from "@context";

type VoteCLIModalState = {
  id: string;
  timestamp: number;
  votes: number[];
}

export const VoteCLIModal = forwardRef<HTMLDivElement>((_, ref) => {
  const { state, closeModal } = useModal<VoteCLIModalState>();

  const payload = `{
    "action": "cast_vote",
    "slot": "<insert Cardano slot number of the moment of your vote>",
    "data": {
      "event": "TEST_CC_VOTE",
      "category": "CC_CATEGORY_TEST_144E",
      "proposal": "37d5f23a-c7f2-426e-8e23-4778d09c9459",
      "id": "${state?.id}",
      "votedAt": "<insert Cardano slot number of the moment of your vote>",
      "votingPower": "<insert your wallet voting power here>",
      "timestamp": ${state?.timestamp},
      "walletId": ""<insert your wallet id>"",
      "walletType": "CARDANO",
      "network": ${import.meta.env.VITE_TARGET_NETWORK},
      "votes": ${JSON.stringify(state?.votes)},
    }
  }`;

  return (
    <ModalWrapper
      dataTestId={ "voting-modal"}
      hideCloseButton={true}
      ref={ref}
      sx={{ padding: '32px 40px', minWidth: '800px' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <Typography variant="h1">Vote using a Command-Line Interface</Typography>
        <Typography variant="body1">
          Copy the following vote metadata and use it as a payload to submit a transaction using CLI tool
        </Typography>
      </Box>
      <Box sx={{ padding: '16px 0' }}>
        <CopyBlock
          language={'JavaScript'}
          text={payload}
          showLineNumbers={true}
          theme={dracula}
        />
      </Box>
      <Box sx={{ padding: '0 16px' }}>
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
