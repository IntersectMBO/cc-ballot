import { useEffect, useRef, useState} from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@atoms";
import {useCardano, useModal} from "@context";
import { geographicRepresentationList, getInitials, getPayloadData, shuffle } from "@utils";
import { CandidatesListItem } from "./CandidatesListItem/CandidatesListItem.tsx";
import { Candidate } from "@models";
import { DataActionsBar } from "@/components/molecules";
import {
  getDrepInfo,
  SignedWeb3Request,
  submitVote,
  getVotes,
  getVoteReceipt,
} from "@services";

type CandidatesListProps = {
  candidates: Candidate[];
  isEditActive: boolean;
  isVoteActive: boolean;
};

export const CandidatesList = ({ candidates, isEditActive, isVoteActive }: CandidatesListProps) => {
  const EVENT: string = import.meta.env.VITE_EVENT;
  const CATEGORY: string  = import.meta.env.VITE_CATEGORY;
  const PROPOSAL: string  = import.meta.env.VITE_PROPOSAL;
  const WALLET_TYPE: string  = import.meta.env.VITE_WALLET_TYPE;
  const TARGET_NETWORK: string  = import.meta.env.VITE_TARGET_NETWORK;

  const { isEnabled, walletApi, dRepID, pubDRepKey } = useCardano();

  const walletApiRef = useRef(walletApi);
  const pubDRepKeyRef = useRef(pubDRepKey);

  useEffect(() => {
    if (pubDRepKeyRef.current && !pubDRepKey) {
      setVotes([]);
    }

    const fetchVotes = async () => {
      if (pubDRepKey) {
        const {walletId} = await getPayloadData(pubDRepKey, openModal);

        try {
          const response = await getVotes(
            EVENT,
            CATEGORY,
            WALLET_TYPE,
            walletId,
          );

          setVotes(response.data.votes);
        } catch (e) {
          console.log('no votes found');
        }
      }
    }

    if (isVoteActive) {
      fetchVotes();
    }

    pubDRepKeyRef.current = pubDRepKey;
  }, [pubDRepKey]);

  const { openModal, closeModal } = useModal();

  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [sortOpen, setSortOpen] = useState<boolean>(false);
  const [chosenSorting, setChosenSorting] = useState<string>("Random");
  const [searchText, setSearchText] = useState<string>("");
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [chosenFilters, setChosenFilters] = useState<string[][]>([[],[],[]]);

  const [votes, setVotes] = useState<number[]>([]);

  const [recastVote] = useState<boolean>(false);

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
      type: "voteConfirmModal",
      state: {
        onConfirm: () => {
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
                    cliVote: voteCLI,
                  }
                });
              },
            }
          });
        }
      }
    });
  }

  const fetchVoteRecipt = async () => {
    if (!walletApiRef.current) return;

    const { slotNumber, walletId } = await getPayloadData(pubDRepKey, openModal);

    try {
      const payload = {
        action: "view_vote_receipt",
        slot: slotNumber,
        data: {
          event: EVENT,
          category: CATEGORY,
          proposal: PROPOSAL,
          timestamp: Math.floor(Date.now() / 1000),
          walletId,
          walletType: WALLET_TYPE,
          network: TARGET_NETWORK,
        }
      };

      const payloadStr = JSON.stringify(payload);
      const payloadHex = await toHex(payloadStr);

      const signed = await walletApiRef.current?.cip95.signData(dRepID, payloadHex);

      const voteReceipt = await getVoteReceipt(signed, payloadStr, WALLET_TYPE);

      openModal({
        type: "textModal",
        state: {
          title: 'Your vote details',
          response: voteReceipt,
        }
      });
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        openModal({
          type: "statusModal",
          state: {
            status: "warning",
            title: "Request error",
            message: error.response.data.detail,
            dataTestId: "error-modal",
          },
        });
      } else {
        openModal({
          type: "statusModal",
          state: {
            status: "warning",
            title: 'Error',
            message: error.message ? error.message : error.info,
            dataTestId: "error-modal",
          },
        });
      }
    }
  }

  const vote = async () => {

    if (!walletApiRef.current) return;

    try {
      const { slotNumber, walletId } = await getPayloadData(pubDRepKey, openModal);

      const dRepInfo = await getDrepInfo(dRepID, TARGET_NETWORK);

      const isRegisteredAsDRep = dRepInfo.isRegisteredAsDRep;
      const isRegisteredAsSoleVoter = dRepInfo.isRegisteredAsSoleVoter;

      if (!isRegisteredAsDRep && !isRegisteredAsSoleVoter) {
        throw new Error("Wallet is not registered as a DRep");
      }

      const id = uuidv4();

      const payload = {
        action: "cast_vote",
        slot: slotNumber,
        data: {
          event: EVENT,
          category: CATEGORY,
          proposal: PROPOSAL,
          id: id,
          votedAt: slotNumber,
          timestamp: Math.floor(Date.now() / 1000),
          walletId,
          walletType: WALLET_TYPE,
          network: TARGET_NETWORK,
          votes: selectedCandidates
        }
      };

      const payloadStr = JSON.stringify(payload);

      const payloadHex = await toHex(payloadStr);

      const signed: SignedWeb3Request = await walletApiRef.current?.cip95.signData(dRepID, payloadHex);

      await submitVote(signed, payloadStr, WALLET_TYPE);

      setVotes(selectedCandidates);
      setSelectedCandidates([]);
      openModal({
        type: "statusModal",
        state: {
          status: "success",
          title: 'Great!',
          message: 'You voted successfully.',
          dataTestId: "success-modal",
        },
      });
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        openModal({
          type: "statusModal",
          state: {
            status: "warning",
            title: "Request error",
            message: error.response.data.detail,
            dataTestId: "error-modal",
          },
        });
      } else {
        openModal({
          type: "statusModal",
          state: {
            status: "warning",
            title: 'Error',
            message: error.message ? error.message : error.info,
            dataTestId: "error-modal",
          },
        });
      }
    }
  }

  const voteCLI = async (jsonStr: string, drepId: string, id: string, timestamp: number, slotNumber: number) => {
    try {
      const json = JSON.parse(jsonStr);

      const payload = {
        action: 'cast_vote',
        slot: slotNumber,
        data: {
          event: import.meta.env.VITE_EVENT,
          category: import.meta.env.VITE_CATEGORY,
          proposal: import.meta.env.VITE_PROPOSAL,
          id: id,
          votedAt: slotNumber,
          timestamp: timestamp,
          walletId: drepId,
          walletType: import.meta.env.VITE_WALLET_TYPE,
          network: import.meta.env.VITE_TARGET_NETWORK,
          votes: selectedCandidates,
        }
      };

      const signed: SignedWeb3Request = {
        key: json.COSE_Key_hex,
        signature: json.COSE_Sign1_hex,
      };

      const payloadStr = JSON.stringify(payload);

      await submitVote(signed, payloadStr, import.meta.env.VITE_WALLET_TYPE);

      setVotes(selectedCandidates);
      setSelectedCandidates([]);
      openModal({
        type: "statusModal",
        state: {
          status: "success",
          title: 'Great!',
          message: 'You voted successfully.',
          dataTestId: "success-modal",
        },
      });
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        openModal({
          type: "statusModal",
          state: {
            status: "warning",
            title: "Request error",
            message: error.response.data.detail,
            dataTestId: "error-modal",
          },
        });
      } else {
        openModal({
          type: "statusModal",
          state: {
            status: "warning",
            title: 'Error',
            message: error.message ? error.message : error.info,
            dataTestId: "error-modal",
          },
        });
      }
    }
  }

  useEffect(() => {
    setFilteredCandidates(shuffle(candidates));
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
      setFilteredCandidates(shuffle(candidatesTemp));
    } else if (chosenSorting === "Name") {
      setFilteredCandidates(candidatesTemp.sort((a, b) => a.candidate.name.localeCompare(b.candidate.name)));
    }
  }, [chosenSorting, searchText, chosenFilters]);

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '40px 0 24px' }}>
        <Typography variant="h2">Candidates List</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
            <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                  onClick={fetchVoteRecipt}
                  sx={{ cursor: 'pointer' }}
                >
                  Read more
                </Link>
              </Box>
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
