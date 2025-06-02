import { useEffect, useRef, useState} from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@atoms";
import {useCardano, useModal, useSnackbar} from "@context";
import { geographicRepresentationList, getInitials, getPayloadData } from "@utils";
import { CandidatesListItem } from "./CandidatesListItem/CandidatesListItem.tsx";
import { Candidate } from "@models";
import { DataActionsBar } from "@/components/molecules";
import {getVoteReceipt, submitVote} from "@/services/requests/voteService.ts";

type CandidatesListProps = {
  candidates: Candidate[];
  isEditActive: boolean;
  isVoteActive: boolean;
};

export const CandidatesList = ({ candidates, isEditActive, isVoteActive }: CandidatesListProps) => {
  const { isEnabled, walletApi } = useCardano();

  const walletApiRef = useRef(walletApi);

  useEffect(() => {
    walletApiRef.current = walletApi;
  }, [walletApi]);

  const { openModal, closeModal } = useModal();

  const { addSuccessAlert, addErrorAlert } = useSnackbar();

  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>(candidates);
  const [sortOpen, setSortOpen] = useState<boolean>(false);
  const [chosenSorting, setChosenSorting] = useState<string>("Random");
  const [searchText, setSearchText] = useState<string>("");
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [chosenFilters, setChosenFilters] = useState<string[][]>([[],[],[]]);

  const [votes, setVotes] = useState<number[]>([]);

  const [recastVote, setRecastVote] = useState<boolean>(false);

  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);

  const geographicRepresentation = geographicRepresentationList().map(item => ({ key: item.label, label: item.label }));

  const filterOptions = [
    [
      { key: "Individual", label: "Individual" },
      { key: "Company", label: "Company" },
      { key: "Consortium", label: "Consortium" },
    ],
    [
      { key: "Yes", label: "Yes" },
      { key: "No", label: "No" },
    ],
    geographicRepresentation
  ];

  const sortOptions = [
    { key: "Random", label: "Random" },
    { key: "Name", label: "Name" },
  ];

  const onCandidateSelect = (id: number) => {
    setSelectedCandidates((prev) => [...prev, id]);
  }

  const onCandidateDeselect = (id: number) => {
    setSelectedCandidates((prev) => prev.filter(candidateId => candidateId !== id));
  }

  const toHex = (str: string) => {
    return Array.from(new TextEncoder().encode(str))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const openVoteModal = () => {
    openModal({
      type: "voteOptions",
      state: {
        onLightWalletSelect: () => {
          if (isEnabled){
            vote();
            closeModal();
          } else {
            openModal({
              type: "chooseWallet", state: {
                onWalletSelect: () => {
                  vote();
                }
              }
            });
          }
        },
        onCLISelect: () => {
          openModal({
            type: "voteCLIModal",
            state: {
              id: uuidv4(),
              timestamp: Math.floor(Date.now() / 1000),
              votes: selectedCandidates,
            }
          });
        },
      }
    });
  }

  const vote = async () => {

    if (!walletApiRef.current) return;

    try {
      const { slotNumber, stakeAddress, walletId, votingPower } = await getPayloadData(walletApiRef.current, addErrorAlert);

      const payload = {
        action: "cast",
        slot: slotNumber,
        data: {
          event: "TEST_CC_VOTE",
          category: "CC_CATEGORY_TEST_144E",
          proposal: "37d5f23a-c7f2-426e-8e23-4778d09c9459",
          id: uuidv4(),
          votedAt: slotNumber,
          votingPower: votingPower,
          timestamp: Math.floor(Date.now() / 1000),
          walletId: walletId,
          walletType: "CARDANO",
          network: import.meta.env.VITE_TARGET_NETWORK,
          votes: selectedCandidates
        },
      }

      const payloadStr = JSON.stringify(payload);

      const payloadHex = await toHex(payloadStr);

      const signed = await walletApiRef.current?.signData(stakeAddress, payloadHex);

      const response = await submitVote(signed, payloadStr);

      if (response.ok) {
        addSuccessAlert('You voted successfully!')
      } else {
        addErrorAlert('Voting failure.');
      }
    } catch (error: any) {
      addErrorAlert(error.message);
    }
  }

  const fetchVoteReceipt = async () => {
    if (!walletApi) return;

    try {
      const { slotNumber, stakeAddress, walletId } = await getPayloadData(walletApi, addErrorAlert);

      const payload = {
        action: "view_vote_receipt",
        slot: slotNumber,
        data: {
          event: "TEST_CC_VOTE",
          category: "CC_CATEGORY_TEST_144E",
          proposal: "37d5f23a-c7f2-426e-8e23-4778d09c9459",
          timestamp: Math.floor(Date.now() / 1000),
          walletId,
          walletType: "CARDANO",
          network: import.meta.env.VITE_TARGET_NETWORK,
        }
      };

      const payloadStr = JSON.stringify(payload);

      const payloadHex = await toHex(payloadStr);

      const signed = await walletApi?.signData(stakeAddress, payloadHex);

      const response = await getVoteReceipt(signed, payloadStr);

      const resPayload: { votes: number[] } = JSON.parse(response.payload);

      setVotes(resPayload.votes);
    } catch (error: any) {
      console.error(error);
      addErrorAlert(error.message);
    }
  }

  useEffect(() => {
    setFilteredCandidates(candidates);
  }, [candidates]);

  useEffect(() => {
    let candidatesTemp = candidates
      .filter((candidate) => candidate.candidate.name.toLowerCase().includes(searchText.toLowerCase()));

    if(chosenFilters[0].length > 0) {
      candidatesTemp = candidatesTemp.filter((candidate) => chosenFilters[0].map(filter => filter.toLowerCase()).includes(candidate.candidate.candidateType));
    }

    if(chosenFilters[1].length > 0) {
      candidatesTemp = candidatesTemp.filter((candidate => chosenFilters[1].map(filter => filter === "Yes").includes(candidate.candidate.verified)));
    }

    if(chosenFilters[2].length > 0) {
      candidatesTemp = candidatesTemp.filter((candidate => chosenFilters[2].map(filter => filter).includes(candidate.candidate.country)));
    }

    if (chosenSorting === "Random") {
      setFilteredCandidates(candidatesTemp);
    } else if (chosenSorting === "Name") {
      setFilteredCandidates(candidatesTemp.sort((a, b) => a.candidate.name.localeCompare(b.candidate.name)));
    }
  }, [chosenSorting, searchText, chosenFilters]);

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '40px 0 24px' }}>
        <Typography variant="h2">Candidates List</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DataActionsBar
            chosenSorting={chosenSorting}
            closeSorts={() => setSortOpen(false)}
            closeFilters={() => setFilterOpen(false)}
            searchText={searchText}
            setChosenSorting={setChosenSorting}
            setSearchText={setSearchText}
            setSortOpen={setSortOpen}
            sortOpen={sortOpen}
            filterOptions={filterOptions}
            filtersTitle={['Candidate Type', 'Authenticated X account', 'Geographic Representation']}
            sortOptions={sortOptions}
            filtersOpen={filterOpen}
            setFiltersOpen={setFilterOpen}
            setChosenFilters={setChosenFilters}
            chosenFilters={chosenFilters}
            chosenFiltersLength={chosenFilters.flat().length}
          />
          {isVoteActive && (!votes.length || recastVote)  && (
            <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center'}}>
              {isEnabled && (
                <Button
                  onClick={fetchVoteReceipt}
                >
                  Check your vote
                </Button>
              )}
              <Chip
                label={`${selectedCandidates.length}/7 votes`}
                sx={{
                  borderRadius: '100px',
                  color: '#212A3D',
                  backgroundColor: '#EDEBFF',
                }}
              />
              <Button
                disabled={selectedCandidates.length === 0}
                onClick={openVoteModal}
                sx={{ minWidth: '162px'}}
              >
                {selectedCandidates.length === 0 ? 'Vote' : 'Submit your vote'}
              </Button>
            </Box>
          )}
          {isVoteActive && isEnabled && !!votes.length && !recastVote && (
            <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center'}}>
              <Box
                sx={{
                  height: '33px',
                  padding: '0 12px',
                  borderRadius: '100px',
                  backgroundColor: '#EDEBFF',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Typography component="span" variant="body2">Your vote has been cast. </Typography>
                <Link
                  variant="body2"
                  onClick={() => openModal({
                    type: "textModal",
                    state: {
                      title: 'Read more',
                      text: 'Suspendisse eleifend pretium est, vitae eleifend quam sagittis ac. Etiam cursus mi enim, in auctor magna interdum blandit. Ut iaculis tristique leo, nec placerat dui. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Mauris egestas magna a felis pulvinar sodales. Maecenas eu nisi ut purus suscipit aliquam et in ligula. Nulla a augue lorem. Nunc eu gravida justo. Mauris urna dolor, vulputate id aliquet id, iaculis quis magna. Suspendisse sit amet nisi egestas, sodales nulla non, pharetra mauris.'
                    }
                  })}
                  sx={{ cursor: 'pointer' }}
                >
                  Read more
                </Link>
              </Box>
              <Button
                variant="text"
                onClick={() => setRecastVote(true)}
                sx={{ minWidth: '162px'}}
              >
                {'Recast your vote'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '24px', paddingBottom: '24px', minHeight: '277px' }}>
        {filteredCandidates.map((candidate) => (
          <CandidatesListItem
            bio={candidate.candidate.about}
            candidateType={candidate.candidate.candidateType}
            id={candidate.candidate.id}
            initials={getInitials(candidate.candidate.name)}
            key={candidate.candidate.id}
            name={candidate.candidate.name}
            verified={candidate.candidate.verified}
            publicContact={candidate.candidate.publicContact}
            stakeId={candidate.candidate.stakeId}
            drepId={candidate.candidate.drepId}
            socialX={candidate.candidate.socialX}
            socialLinkedin={candidate.candidate.socialLinkedin}
            socialDiscord={candidate.candidate.socialDiscord}
            socialTelegram={candidate.candidate.socialTelegram}
            socialOther={candidate.candidate.socialOther}
            walletAddress={candidate.candidate.walletAddress}
            isEditActive={isEditActive}
            isVoteActive={isVoteActive}
            onCandidateSelect={onCandidateSelect}
            onCandidateDeselect={onCandidateDeselect}
            selected={selectedCandidates.includes(candidate.candidate.id)}
            disableSelect={selectedCandidates.length > import.meta.env.VITE_MAX_VOTES - 1}
            voteCast={votes.length > 0}
            voted={votes.includes(candidate.candidate.id)}
            recast={recastVote}
          />
        ))}
      </Box>
    </Box>
  );
}
