
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Typography from '@mui/material/Typography';
import {ICONS} from "@consts";
import {Button} from "@atoms";
import {useModal} from "@context";
import { Proof, VoteDetails } from "@services";


type VoteResultsListItemProps = {
  id: number;
  name: string;
  initials: string;
  candidateType: "individual" | "company" | "consortium";
  verified: boolean;
  votes: number;
  votesCount: number;
  votingPower?: string;
  votesDetails: VoteDetails[];
  proofs?: Proof[];
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
        proofs: props.proofs,
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
        justifyContent: { md: "space-between" },
        alignItems: 'center',
        flexWrap: { xxs: 'wrap', md: 'nowrap' },
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "24px",
          alignItems: "center",
          flex: { xxs: '1 1 35%', md: '0 1 auto' },
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <Box sx={{ position: 'relative', display: { xxs: 'none', md: 'contents' } }}>
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
            display: { xxs: 'none', lg: 'inline-flex' }
          }}
        />
      </Box>
      <Box
        sx={{
          display: { xxs: 'contents', md: "flex" },
          gap: "8px",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            flex: { xxs: '1 1 45%', md: '0 1 auto' },
            height: '21px',
            borderRadius: '100px',
            border: "1px solid #D9DEE8",
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: "6px 12px 6px 8px",
            gap: '8px',
          }}
        >
          <Typography variant="body2">
            {`₳ ${new Intl.NumberFormat(
              "en-US",
              { maximumFractionDigits: 2, minimumFractionDigits: 2 }
            ).format(props.votes / 100000)}`}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: { xxs: '1 1 auto', md: '0 1 auto' },
            height: '21px',
            borderRadius: '100px',
            border: "1px solid #D9DEE8",
            display: { xxs: 'none', md: 'flex' },
            justifyContent: 'center',
            alignItems: 'center',
            padding: "6px 12px 6px 8px",
            gap: '8px',
          }}
        >
          <img src={ICONS.voteIcon} alt="verified" />
          <Typography variant="body2">
            {`${props.votesCount} votes`}
          </Typography>
        </Box>
        <Button
          sx={{ flex: { xxs: '1 1 auto', md: '0 1 auto' } }}
          variant="text"
          onClick={handleDetails}
        >
          See details
        </Button>
      </Box>
    </Box>
  )
}
