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
import {getVoteReceipt, getDrepInfo, SignedWeb3Request, submitVote, VoteReceipt} from "@services";

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

  const { isEnabled, walletApi, dRepID } = useCardano();

  const walletApiRef = useRef(walletApi);

  useEffect(() => {
    walletApiRef.current = walletApi;
  }, [walletApi]);

  const { openModal, closeModal } = useModal();

  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [sortOpen, setSortOpen] = useState<boolean>(false);
  const [chosenSorting, setChosenSorting] = useState<string>("Random");
  const [searchText, setSearchText] = useState<string>("");
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [chosenFilters, setChosenFilters] = useState<string[][]>([[],[],[]]);

  const [votes, setVotes] = useState<number[]>([]);
  const [voteReceipts, setVoteReceipts] = useState<VoteReceipt | null>(null);

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
                  }
                });
              },
            }
          });
        }
      }
    });
  }

  const vote = async () => {

    if (!walletApiRef.current) return;

    try {
      const { slotNumber, delegated_drep } = await getPayloadData(walletApiRef.current, openModal);

      if (delegated_drep === null || !(/^drep1[a-z0-9]*/.test(delegated_drep))) {
        throw new Error("Delegated drep is not valid");
      }

      const isRegisteredAsDRep = (await getDrepInfo(dRepID, TARGET_NETWORK)).isRegisteredAsDRep;

      if (!isRegisteredAsDRep) {
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
          walletId: delegated_drep,
          walletType: WALLET_TYPE,
          network: TARGET_NETWORK,
          votes: selectedCandidates
        },
      }

      const payloadStr = JSON.stringify(payload);

      const payloadHex = await toHex(payloadStr);

      const signed: SignedWeb3Request = await walletApiRef.current?.signData(`${TARGET_NETWORK === 'PREPROD' ? 'e0' : 'e1'}${toHex(delegated_drep)}`, payloadHex);

      await submitVote(signed, payloadStr, WALLET_TYPE);

      const receipt: VoteReceipt = {
        id: id,
        event: EVENT,
        category: CATEGORY,
        proposal: PROPOSAL,
        walletId: delegated_drep,
        walletType: WALLET_TYPE,
        signature: signed.signature,
        payload: payloadStr,
        publicKey: signed.key ? signed.key : '',
        votedAtSlot: slotNumber.toString(),
      }

      setVotes(selectedCandidates);
      setVoteReceipts(receipt);
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
            message: error.message,
            dataTestId: "error-modal",
          },
        });
      }
    }
  }

  const fetchVoteReceipt = async () => {
    if (!walletApi) return;

    try {
      const { slotNumber, delegated_drep } = await getPayloadData(walletApi, openModal);

      if (delegated_drep === null || !(/^drep1[a-z0-9]*/.test(delegated_drep))) {
        throw new Error("Delegated drep is not valid");
      }

      const payload = {
        action: "view_vote_receipt",
        slot: slotNumber,
        data: {
          event: EVENT,
          category: CATEGORY,
          proposal: PROPOSAL,
          timestamp: Math.floor(Date.now() / 1000),
          walletId: delegated_drep,
          walletType: WALLET_TYPE,
          network: TARGET_NETWORK,
        }
      };

      const payloadStr = JSON.stringify(payload);

      const payloadHex = await toHex(payloadStr);

      const signed = await walletApi?.signData(`${TARGET_NETWORK === 'PREPROD' ? 'e0' : 'e1'}${toHex(delegated_drep)}`, payloadHex);

      const response = await getVoteReceipt(signed, payloadStr, WALLET_TYPE);
      setVoteReceipts(response);

      const resPayload: { data: { votes: number[] } } = JSON.parse(response.payload);

      setVotes(resPayload.data.votes);
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
            message: error.message,
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
              {isEnabled && (
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
                  <Typography component="span" variant="body2">Already voted?</Typography>
                  <Link
                    variant="body2"
                    onClick={fetchVoteReceipt}
                    sx={{ cursor: 'pointer' }}
                  >
                    Check your vote
                  </Link>
                </Box>
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
                      title: 'Your vote details',
                      response: voteReceipts,
                    }
                  })}
                  sx={{ cursor: 'pointer' }}
                >
                  Read more
                </Link>
              </Box>
              {/*<Button*/}
              {/*  variant="text"*/}
              {/*  onClick={() => setRecastVote(true)}*/}
              {/*  sx={{ minWidth: '162px'}}*/}
              {/*>*/}
              {/*  {'Recast your vote'}*/}
              {/*</Button>*/}
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
