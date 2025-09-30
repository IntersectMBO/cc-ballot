import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {IMAGES} from "@consts";
import { CandidateDetails } from "@models";
import { getInitials } from "@utils";

import { VoteResultsListItem } from "@/components/VoteResultsListItem/VoteResultsListItem.tsx";
import { Proof, VoteDetails } from "@services";

type Result = CandidateDetails & { votes: number; votesCount: number; votesDetails: VoteDetails[]; proofs: Proof[]; };

type TopResultsListProps = {
  results: Result[];
}

export const TopResultsList = (props: TopResultsListProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingBottom: '20px',
        backgroundColor: 'white', borderRadius: '16px',
        boxShadow: '0px 20px 25px -5px #212A3D14',
        marginTop: '24px'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          padding: { xxs: '16px 24px 8px 24px', md: '16px 12px 8px 8px' },
          gap: '8px',
          alignItems: 'center',
          flexDirection: { xxs: 'column', md: 'row' },
        }}
      >
        <Box
          sx={{
            padding: '21.5px 22px'
          }}
        >
          <img alt="star trophy" src={IMAGES.starTrophy} />
        </Box>
        <Box>
          <Typography variant="h2">Voting results (Top 7)</Typography>
          <Typography variant="body2">Candidates who received enough votes to become CC members</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          padding: '0 8px',
        }}
      >
        {props.results.map((item) => (
          <VoteResultsListItem
            key={item.id}
            id={item.id}
            name={item.name}
            initials={getInitials(item.name)}
            candidateType={item.candidateType}
            verified={item.verified}
            votes={item.votes}
            votesCount={item.votesCount}
            votesDetails={item.votesDetails}
          />
        ))}
      </Box>
    </Box>
  )
}
