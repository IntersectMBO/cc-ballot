import { useNavigate } from "react-router-dom";

import Box from '@mui/material/Box';
// import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Typography from "@mui/material/Typography";

import { Button } from '@atoms';
import { ICONS } from "@consts"
import { useCardano, useModal } from "@context";
import { useGetAllCandidates } from "@hooks";
import { Footer } from "@organisms";

import { CandidatesList } from "@/components/CandidatesList.tsx";
import { Layout } from '@/components/Layout/Layout';
import { TopNav } from "@/components/TopNav.tsx";
import { CCStepper } from "@/components/molecules/CCStepper.tsx";

type HomeProps = {
  applyEndTime: number;
  isVoteActive: boolean;
  isEditActive: boolean;
}

export const Home = ({ applyEndTime, isEditActive, isVoteActive }: HomeProps) => {
  const  navigate = useNavigate();
  const { openModal } = useModal();
  const { isEnabled } = useCardano();

  const steps = ['Application', 'Vote', 'Results'];

  const daysToApply = Math.floor((applyEndTime)/(24 * 60 * 60 * 1000));

  const isApplyActive = applyEndTime > 0;

  const { allCandidates, isAllCandidatesLoading } = useGetAllCandidates();

  return (
    <Box sx={{ backgroundColor: '#f2f4f8', minHeight: '100vh' }}>
      <TopNav title="2025 Constitutional Committee elections" navigateBack={false} />
      <Layout>
        <Box>
          <Box sx={{ padding: { xxs: '0 16px', md: '0 32px', xl: '0 64px'} }}>
            <Box sx={{ padding: '24px 0' }}>
              <CCStepper activeStep={isVoteActive ? 1 : 0} steps={steps} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px 32px 24px', boxShadow: '0px 20px 25px -5px #212A3D14' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Typography variant="h2">Details</Typography>
                {/*<Chip label="Vote type goes here" />*/}
              </Box>
              <Box>
                <Typography variant="caption">CONTEXT</Typography>
                <Box sx={{ paddingBottom: '16px' }}>
                  <Typography variant="body1" color="#506288">
                    This vote is to allow DReps to elect a Constitutional Committee(CC) and then submit a governance action. 
                    
                    The Interim Constitutional Committee term expires on 1st September 2025. 
                    
                    The Constitutional Committee plays a vital role in shaping the future of the Cardano ecosystem by interpreting and upholding the Cardano Constitution. 
                    
                    Anyone committed to contributing to the governance of Cardano can apply to become a Constitutional Committee member, including individuals, companies, and consortia.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
                <Box sx={{ width: '267px', padding: '12px 0' }}>
                  <Typography variant="caption">APPLICATION PERIOD</Typography>
                  <Typography variant="body1">
                    May 5, 2025 6:00 PM (UTC) - May 31, 2025 6:00 PM (UTC)
                  </Typography>
                </Box>
                <Box sx={{ width: '267px', padding: '12px 0' }}>
                  <Typography variant="caption">VOTING PERIOD</Typography>
                  <Typography variant="body1">
                    June 12, 2025 12:00 PM (UTC) - July 2, 2025 12:00 PM (UTC)
                  </Typography>
                </Box>
                <Box sx={{ width: '267px', padding: '12px 0' }}>
                  <Typography variant="caption">RESULTS SHOWN</Typography>
                  <Typography variant="body1">
                    July 6, 2025 12:00 PM (UTC)
                  </Typography>
                </Box>
              </Box>
              {isApplyActive && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  rowGap: '8px',
                  columnGap: '16px',
                  backgroundColor: '#FDE1CE',
                  borderRadius: '4px',
                  padding: '8px 16px'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <img alt="add user" src={ICONS.userAddIcon} />
                    <Typography variant="subtitle2" component="p">
                      {`${daysToApply} more days to candidate yourself`}
                    </Typography>
                  </Box>
                  <Button sx={{ borderRadius: 0 }} onClick={() => {
                    isEnabled ? navigate('/registerCandidate') : openModal({ type: "chooseWallet" });
                  }}>
                    {isEnabled ? 'Apply as a candidate' : 'Connect to apply as a candidate'}
                  </Button>
                </Box>
              )}
              <Box>
                <Typography variant="body2">Guide for voting can be found <Link variant="body2" target="_blank" rel="noopener" href="https://docs.intersectmbo.org/cardano/cardano-governance/cardano-constitution/2025-constitutional-committee-elections/guide-for-voting">here</Link>.</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px 32px 24px', boxShadow: '0px 20px 25px -5px #212A3D14', marginTop: '16px' }}>
              <Box>
                <Typography variant="h2">Voting</Typography>
              </Box>
              <Typography variant="body1">1. You need to be a registered DRep to participate in this vote</Typography>
              <Typography variant="body1">2. Review all candidates carefully</Typography>
              <Typography variant="body1">3. Select up to 7 candidates</Typography>
              <Typography variant="body1">4. Confirm and submit your vote by signing with your wallet</Typography>
              <Typography variant="body1">IMPORTANT: Please take the right time before making your decision. Once your vote is submitted it can NOT be changed.</Typography>
            </Box>
            <Box aria-busy={isAllCandidatesLoading}>
              {!allCandidates || isAllCandidatesLoading ? (
                <Box sx={{ padding: '40px 0 24px' }}>
                  <Box
                    sx={{
                      alignItems: "center",
                      display: "flex",
                      flex: 1,
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress aria-label="Loading" color="secondary" />
                  </Box>
                </Box>
              ) : (
                <CandidatesList
                  candidates={allCandidates}
                  isEditActive={isEditActive}
                  isVoteActive={isVoteActive}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Layout>
      <Footer />
    </Box>
  )
}
