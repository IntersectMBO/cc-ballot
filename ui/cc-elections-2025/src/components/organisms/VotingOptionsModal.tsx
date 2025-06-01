import {forwardRef} from "react";

import { ModalWrapper } from "@atoms";
import { Button } from "@atoms";
import { Box, Typography } from "@mui/material";
import {useModal} from "@context";
import {ICONS} from "@consts";

type VotingOptionsModalState = {
  onLightWalletSelect: () => void;
  onCLISelect: () => void;
}

export const VotingOptionsModal = forwardRef<HTMLDivElement>((_, ref) => {
  const { state, closeModal } = useModal<VotingOptionsModalState>();

  return (
    <ModalWrapper
      dataTestId={ "voting-modal"}
      hideCloseButton={true}
      ref={ref}
      sx={{ padding: '32px 24px', minWidth: '800px' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 16px'}}>
        <Typography variant="h1">Select how you vote</Typography>
        <Typography variant="body1">
          Choose what do you want to use to cast your vote
        </Typography>
      </Box>
      <Box>
        <Box sx={{ display: 'flex', padding: '24px 0', gap: '12px' }}>
          <Box sx={{
            borderColor: '#D9DEE8',
            borderStyle: "solid",
            borderWidth: '1px',
            borderRadius: '16px',
            padding: '20px 24px',
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center'
          }}>
            <Typography variant="h2" sx={{ textAlign: "center" }}>
              Lightwallet
            </Typography>
            <img src={ICONS.walletIcon} alt="Lightwallet" width={48} />
            <Box sx={{ paddingTop: '12px', width: '100%' }}>
              <Button
                sx={{ width: '100%'}}
                onClick={state?.onLightWalletSelect}
              >
                Select
              </Button>
            </Box>
          </Box>
          <Box sx={{
            borderColor: '#D9DEE8',
            borderStyle: "solid",
            borderWidth: '1px',
            borderRadius: '16px',
            padding: '20px 24px',
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center'
          }}>
            <Typography variant="h2" sx={{ textAlign: "center" }}>
              CLI
            </Typography>
            <img src={ICONS.terminalIcon} alt="CLI" width={48} />
            <Box sx={{ paddingTop: '12px', width: '100%' }}>
              <Button
                sx={{ width: '100%'}}
                onClick={state?.onCLISelect}
              >
                Select
              </Button>
            </Box>
          </Box>
        </Box>
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
