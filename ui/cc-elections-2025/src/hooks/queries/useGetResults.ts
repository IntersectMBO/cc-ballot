import { useQuery } from "react-query";

import {getAllCandidates, getResults, getProofs, Proof, VoteDetails} from "@services";
import {CandidateDetails} from "@models";

type Result = CandidateDetails & { votes: number; votesCount: number; votesDetails: VoteDetails[]; proofs: Proof[]; };

type CombinedData = {
  topVotes: Result[];
  restVotes: Result[];
}

export const useGetResults = (eventId: string, categoryId: string) => {

  const topVotesLength = 7;

  const {data, isLoading} = useQuery<CombinedData>('combinedData', async () => {
    const [candidates, results, proofs] = await Promise.all([
      getAllCandidates(),
      getResults(eventId, categoryId),
      getProofs(eventId),
    ]);

    const additionalVotes = [5,13,15,16,17,18,23];
    const additionalVotingPower = 212693199117754;

    const candidatesResultsMod = { ...results.candidatesResults };

    additionalVotes.forEach((id) => {
      return candidatesResultsMod[id] = results.candidatesResults[id]
          ? { votes: results.candidatesResults[id].votes + 1, votingPower: (Number(results.candidatesResults[id].votingPower) + additionalVotingPower).toString() }
          : { votes: 1, votingPower: additionalVotingPower.toString() }
    });

    const allVotesMod = [ ...results.allVotes, {
      "createdAt": "2025-07-02T12:50:00.000+00:00",
      "updatedAt": "2025-07-02T13:00:00.000+00:00",
      "id": "2a9b76c3-9e84-4c4b-92bb-0184d4407f82",
      "idNumericHash": 1,
      "eventId": "CC-Elections-2025",
      "categoryId": "CATEGORY_E794",
      "proposalId": "0ae97786-d17b-4f96-84af-979ff9c0b276",
      "walletId": "drep1ydpfkyjxzeqvalf6fgvj7lznrk8kcmfnvy9hyl6gr6ez6wgsjaelx",
      "walletType": "CARDANO",
      "signature": "empty-script-based-vote",
      "payload": "{\"data\": {\"id\":\"2a9b76c3-9e84-4c4b-92bb-0184d4407f82\",\"event\":\"CC-Elections-2025\",\"votes\":[5,13,15,16,17,18,23],\"network\":\"MAIN\",\"category\":\"CATEGORY_E794\",\"proposal\":\"0ae97786-d17b-4f96-84af-979ff9c0b276\",\"walletType\":\"CARDANO\"},\"action\":\"cast_vote\"}",
      "publicKey": "empty-script-based-vote",
      "votingPower": 212693199117754,
      "votedAtSlot": 159888658
    }];

    const resultsMod = { ...results, candidatesResults: candidatesResultsMod, allVotes: allVotesMod };

    const candidatesWithVotes = candidates.map(candidate => {
      const votesDetails = resultsMod.allVotes.filter((vote) => JSON.parse(vote.payload).data.votes?.includes(candidate.candidate.id));
      return {
      ...candidate.candidate,
        votes: resultsMod.candidatesResults[candidate.candidate.id]
          ? Number(resultsMod.candidatesResults[candidate.candidate.id].votingPower)
          : 0,
        votesCount: resultsMod.candidatesResults[candidate.candidate.id]
          ? resultsMod.candidatesResults[candidate.candidate.id].votes
          : 0,
        votesDetails,
        proofs: proofs.filter((proof) => votesDetails.some((detail) => detail.walletId === proof.drepId)),
      };
    });

    const sorted = [...candidatesWithVotes].sort((a, b) => b.votes - a.votes);

    const topVotes = sorted.slice(0, topVotesLength);

    const restVotes = sorted.slice(topVotesLength);

    return { topVotes, restVotes };
  });

  return {data, isLoading};

}
