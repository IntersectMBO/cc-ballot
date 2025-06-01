import {forwardRef} from "react";

import { ModalWrapper } from "@atoms";
import { Button } from "@atoms";
import { Box, Typography } from "@mui/material";
import {useModal} from "@context";
import IconButton from "@mui/material/IconButton";
import {ICONS} from "@consts";
import Link from "@mui/material/Link";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import {useNavigate} from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import {LinkIcon} from "@/components/atoms/LinkIcon.tsx";

type CandidateDetailsModalState = {
  id: number;
  name: string;
  initials: string;
  candidateType: string;
  walletAddress: string;
  publicContact: string;
  stakeId: string;
  drepId: string;
  socialX: string;
  socialLinkedin: string;
  socialDiscord: string;
  socialTelegram: string;
  socialOther: string;
  verified: boolean;
}

export const CandidateDetailsModal = forwardRef<HTMLDivElement>((_, ref) => {
  const navigate = useNavigate();
  const { state, closeModal } = useModal<CandidateDetailsModalState>();

  if (!state) {
    return null;
  }

  return (
    <ModalWrapper
      dataTestId={ "voting-modal"}
      hideCloseButton={true}
      ref={ref}
      sx={{ padding: '24px' }}
    >
      <Box sx={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '16px',
        borderBottom: '1px solid #CAC4D0',
      }}>
        <Typography variant="h3">Candidate Details</Typography>
        <IconButton
          onClick={closeModal}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            padding: '16px 0 8px 0', gap: '8px', justifyContent: 'space-between', alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Box sx={{ position: 'relative'}}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  color: '#3052F5',
                  backgroundColor: '#EDEBFF',
                }}
              >
                {state.initials}
              </Avatar>
              {state.verified && (
                <Tooltip title={'Authenticated X account'}>
                  <img src={ICONS.verifiedIcon} alt="verified" style={{ position: 'absolute', bottom: '0', right: '-5px' }}/>
                </Tooltip>
              )}
            </Box>
            <Typography variant="h3" sx={{ wordWrap: 'break-word' }}>
              {state.name}
            </Typography>
          </Box>
          <Box>
            <Chip
              label={state.candidateType}
              sx={{
                borderRadius: '100px',
                color: '#212A3D',
                backgroundColor: '#EDEBFF',
              }}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <Box>
            <Typography variant="subtitle2">WALLET ADDRESS</Typography>
            <Typography variant="body1" sx={{wordWrap: 'break-word'}}>{state.walletAddress}</Typography>
          </Box>
          {state.publicContact && (
            <Box sx={{ padding: '8px 0'}}>
              <Typography variant="subtitle2">PUBLIC POINT OF CONTACT</Typography>
              <Box sx={{wordWrap: 'break-word'}}>
                <Link variant="body2" target="_blank" rel="noopener"
                      href={`mailto: ${state.publicContact}`}>{state.publicContact}</Link>
              </Box>
            </Box>
          )}
          <Box
            sx={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            {state.socialX && (
              <Button
                onClick={() => {
                  window.open(state.socialX, '_blank', 'noopener,noreferrer');
                }}
                startIcon={<LinkIcon />}
                variant="text"
                sx={{ fontWeight: 400 }}
              >
                X (Twitter)
              </Button>
            )}
            {state.socialLinkedin && (
              <Button
                onClick={() => {
                  window.open(state.socialLinkedin, '_blank', 'noopener,noreferrer');
                }}
                startIcon={<LinkIcon />}
                variant="text"
                sx={{ fontWeight: 400 }}
              >
                Linkedin
              </Button>
            )}
            {state.socialDiscord && (
              <Button
                onClick={() => {
                  window.open(state.socialDiscord, '_blank', 'noopener,noreferrer');
                }}
                startIcon={<LinkIcon />}
                variant="text"
                sx={{ fontWeight: 400 }}
              >
                Discord
              </Button>
            )}
            {state.socialTelegram && (
              <Button
                onClick={() => {
                  window.open(state.socialTelegram, '_blank', 'noopener,noreferrer');
                }}
                startIcon={<LinkIcon />}
                variant="text"
                sx={{ fontWeight: 400 }}
              >
                Telegram
              </Button>
            )}
            {state.socialOther && (
              <Button
                onClick={() => {
                  window.open(state.socialOther, '_blank', 'noopener,noreferrer');
                }}
                startIcon={<LinkIcon />}
                variant="text"
                sx={{ fontWeight: 400 }}
              >
                Other
              </Button>
            )}
          </Box>
          {state.drepId && (
            <Box>
              <Typography variant="subtitle2">DREP ID</Typography>
              <Typography variant="body1" sx={{wordWrap: 'break-word'}}>{state.drepId}</Typography>
            </Box>
          )}
          {state.stakeId && (
            <Box>
              <Typography variant="subtitle2">STAKE ID</Typography>
              <Typography variant="body1" sx={{wordWrap: 'break-word'}}>{state.stakeId}</Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            variant="outlined"
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Button
            onClick={
              () => {
                navigate(`/candidateDetails/${state.id}`);
                closeModal();
              }
            }
          >
            Go to candidate profile
          </Button>
        </Box>
      </Box>
    </ModalWrapper>
  )
});
