import { useNavigate } from "react-router-dom";

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Typography from '@mui/material/Typography';

import { Button } from '@atoms';
import { ICONS } from "@consts";

type CandidatesListItemProps = {
  id: number;
  name: string;
  initials: string;
  bio: string;
  candidateType: "individual" | "company" | "consortium";
  verified: boolean;
};

export const CandidatesListItem = (props: CandidatesListItemProps) => {
  const  navigate = useNavigate();

  const handleClick = () => {
    navigate(`/candidateDetails/${props.id}`);
  };

  const chipText = (candidateType: "individual" | "company" | "consortium") => {
    return candidateType?.charAt(0).toUpperCase() + candidateType?.slice(1);
  };

  return (
    <Box sx={{
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0px 20px 25px -5px #212A3D14',
      minWidth: '300px',
      width: { xs: '100%', md: 'calc(50% - 12px)', lg: 'calc(33.33% - 16px)' },
    }}>
      <Box sx={{ display: 'flex', padding: '16px 12px 8px 24px', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
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
              {props.initials}
            </Avatar>
            {props.verified && (
              <Tooltip title={'Verified applicant'}>
                <img src={ICONS.verifiedIcon} alt="verified" style={{ position: 'absolute', bottom: '0', right: '-5px' }}/>
              </Tooltip>
            )}
          </Box>
          <Typography variant="h3">
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
      <Box sx={{ padding: '20px 24px 16px' }}>
        <Typography variant="body1">
          {props.bio.length > 140 ? `${props.bio.substring(0, 140)}...` : props.bio}
        </Typography>
      </Box>
      <Box sx={{ paddingBottom: '20px', paddingRight: '24px', paddingLeft: '24px' }}>
        <Button variant="text" onClick={handleClick}>Read more</Button>
      </Box>
    </Box>
  )
}
