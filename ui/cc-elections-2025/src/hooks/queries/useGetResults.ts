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

    const candidatesWithVotes = candidates.map(candidate => {
      const votesDetails = results.allVotes.filter((vote) => JSON.parse(vote.payload).data.votes?.includes(candidate.candidate.id));
      return {
      ...candidate.candidate,
        votes: results.candidatesResults[candidate.candidate.id]
          ? results.candidatesResults[candidate.candidate.id].votes * Number(results.candidatesResults[candidate.candidate.id].votingPower)
          : 0,
        votesCount: results.candidatesResults[candidate.candidate.id]
          ? results.candidatesResults[candidate.candidate.id].votes
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
