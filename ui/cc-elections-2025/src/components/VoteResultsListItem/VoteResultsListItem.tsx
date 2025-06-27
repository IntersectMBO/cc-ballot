
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Typography from '@mui/material/Typography';
import {ICONS} from "@consts";
import {Button} from "@atoms";
import {useModal} from "@context";
import { VoteReceipt } from "@services";


type VoteResultsListItemProps = {
  id: number;
  name: string;
  initials: string;
  candidateType: "individual" | "company" | "consortium";
  verified: boolean;
  votes: number;
  votingPower?: string;
  votesDetails: VoteReceipt[];
}

export const VoteResultsListItem = (props: VoteResultsListItemProps) => {
  const { openModal } = useModal();

  const chipText = (candidateType: "individual" | "company" | "consortium") => {
    return candidateType?.charAt(0).toUpperCase() + candidateType?.slice(1);
  };

  const handleDetails = () => {
    openModal({
      type: "textModal",
      state: {
        title: 'Candidate voting results',
        response: props.votesDetails,
      }
    });
  }

  return (
    <Box
      sx={{
        padding: "12px 12px 12px 16px",
        borderBottom: "1px solid #D9DEE8",
        display: "flex",
        gap: "8px",
        justifyContent: "space-between",
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "24px",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <Box sx={{ position: 'relative'}}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                color: '#3052F5',
                backgroundColor: '#EDEBFF',
                fontSize: '14px',
              }}
            >
              {props.initials}
            </Avatar>
            {props.verified && (
              <Tooltip title={'Authenticated X account'}>
                <img src={ICONS.verifiedIcon} width={16} alt="verified" style={{ position: 'absolute', bottom: '0', right: '-5px' }}/>
              </Tooltip>
            )}
          </Box>
          <Typography variant="h5" sx={{ wordWrap: 'break-word' }}>
            {props.name}
          </Typography>
        </Box>
        <Chip
          label={chipText(props.candidateType)}
          sx={{
            borderRadius: '100px',
            color: '#212A3D',
            backgroundColor: '#EDEBFF',
          }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            height: '21px',
            borderRadius: '100px',
            border: "1px solid #D9DEE8",
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: "6px 12px 6px 8px",
            gap: '8px',
          }}
        >
          <img src={ICONS.voteIcon} alt="verified" />
          <Typography variant="body2">
            {`${props.votes} votes`}
          </Typography>
        </Box>
        <Button variant="text" onClick={handleDetails}>See details</Button>
      </Box>
    </Box>
  )
}
