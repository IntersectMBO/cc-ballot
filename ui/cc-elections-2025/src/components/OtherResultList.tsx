import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {VoteResultsListItem} from "@/components/VoteResultsListItem/VoteResultsListItem.tsx";
import {CandidateDetails} from "@models";
import {getInitials} from "@utils";
import { Proof, VoteDetails } from "@services";

type Result = CandidateDetails & { votes: number; votesCount: number; votesDetails: VoteDetails[]; proofs: Proof[]; };

type OtherResultsListProps = {
  results: Result[];
}

export const OtherResultsList = (props: OtherResultsListProps) => {
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
          padding: '16px 12px 8px 24px',
          gap: '8px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h2">
            {`Other candidates (${props.results.length})`}
          </Typography>
          <Typography variant="body2">Candidates who didn't get enough votes to become CC members</Typography>
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
            proofs={item.proofs}
          />
        ))}
      </Box>
    </Box>
  )
}
