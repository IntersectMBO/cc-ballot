import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { v4 as uuidv4 } from "uuid";
import {
  Address,
} from "@emurgo/cardano-serialization-lib-asmjs";

import { Button } from "@atoms";
import { useCardano } from "@context";
import { geographicRepresentationList, getInitials } from "@utils";
import { CandidatesListItem } from "./CandidatesListItem/CandidatesListItem.tsx";
import { Candidate } from "@models";
import { DataActionsBar } from "@/components/molecules";
import {getSlotNumber, submitVote } from "@/services/requests/voteService.ts";
import {Buffer} from "buffer";

type CandidatesListProps = {
  candidates: Candidate[];
  isEditActive: boolean;
  isVoteActive: boolean;
};

export const CandidatesList = ({ candidates, isEditActive, isVoteActive }: CandidatesListProps) => {
  const { isEnabled, walletApi } = useCardano();

  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>(candidates);
  const [sortOpen, setSortOpen] = useState<boolean>(false);
  const [chosenSorting, setChosenSorting] = useState<string>("Random");
  const [searchText, setSearchText] = useState<string>("");
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [chosenFilters, setChosenFilters] = useState<string[][]>([[],[],[]]);

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

  const vote = async () => {
    if(walletApi) {
      try {
        // @ts-ignore
        const slotNumber = (await getSlotNumber())?.absoluteSlot;

        const rewardAddresses = await walletApi.getRewardAddresses();
        const stakeAddress = rewardAddresses[0];

        const stakeAddressHex = Address.from_bytes(Buffer.from(stakeAddress, 'hex'));

        const walletId = stakeAddressHex.to_bech32();

        const payload = {
          action: "CAST_VOTE",
          slot: slotNumber,
          data: {
            event: "CANDIDATES_123",
            category: "MAIN_1",
            proposal: "36cfad40-29fc-4832-8d3f-ec4b795cb134",
            id: uuidv4(),
            votedAt: slotNumber,
            votingPower: "1",
            walletId: walletId,
            walletType: "CARDANO",
            network: import.meta.env.VITE_TARGET_NETWORK,
            votes: selectedCandidates
          },
        }

        const payloadStr = JSON.stringify(payload);
        const payloadHex = await toHex(payloadStr);

        const signed = await walletApi.signData(stakeAddress, payloadHex);

        const response = await submitVote(signed, payloadStr);

        if(response.ok) {
          alert('OK');
        } else {
          console.error(response);
        }

      } catch (error) {
        console.log(error);
      }
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
          {isVoteActive && !isEnabled && (
            <Button sx={{ borderRadius: 0 }}>Connect wallet to vote</Button>
          )}
          {isVoteActive && isEnabled && (
            <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center'}}>
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
                onClick={vote}
                sx={{ minWidth: '162px'}}
              >
                {selectedCandidates.length === 0 ? 'Vote' : 'Submit your vote'}
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
            walletAddress={candidate.candidate.walletAddress}
            isEditActive={isEditActive}
            isVoteActive={isVoteActive}
            onCandidateSelect={onCandidateSelect}
            onCandidateDeselect={onCandidateDeselect}
            selected={selectedCandidates.includes(candidate.candidate.id)}
            disableSelect={selectedCandidates.length > import.meta.env.VITE_MAX_VOTES - 1}
          />
        ))}
      </Box>
    </Box>
  );
}
