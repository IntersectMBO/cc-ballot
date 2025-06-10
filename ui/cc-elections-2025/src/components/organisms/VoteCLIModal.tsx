import {forwardRef} from "react";
import { CopyBlock, dracula } from "react-code-blocks";

import { ModalWrapper } from "@atoms";
import { Button } from "@atoms";
import { Box, Link, Typography } from "@mui/material";
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
      "event": "${import.meta.env.VITE_EVENT}",
      "category": "${import.meta.env.VITE_CATEGORY}",
      "proposal": "${import.meta.env.VITE_PROPOSAL}",
      "id": "${state?.id}",
      "votedAt": "<insert Cardano slot number of the moment of your vote>",
      "timestamp": ${state?.timestamp},
      "walletId": "<insert your wallet id>",
      "walletType": "${import.meta.env.VITE_WALLET_TYPE}",
      "network": "${import.meta.env.VITE_TARGET_NETWORK}",
      "votes": ${JSON.stringify(state?.votes)},
    }
  }`;

  return (
    <ModalWrapper
      dataTestId={ "voting-modal"}
      hideCloseButton={true}
      ref={ref}
      sx={{ padding: { md: '32px 40px' }, minWidth: { lg: '800px' } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <Typography variant="h1">Vote using a Command-Line Interface</Typography>
        <Typography variant="body1">
          Copy the following vote metadata and use it as a payload to submit a transaction using <Link variant="body1" target="_blank" rel="noopener" href="https://github.com/IntersectMBO/cc-ballot/tree/cc-elections-2025/cli/cc-ballot-cli">CLI tool</Link>
        </Typography>
      </Box>
      <Box sx={{ padding: '16px 0' }}>
        <CopyBlock
          language={'JavaScript'}
          text={payload}
          showLineNumbers={true}
          theme={dracula}
          customStyle={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowX: "auto",
          }}
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
