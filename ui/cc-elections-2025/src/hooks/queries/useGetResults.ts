import { useQuery } from "react-query";

import {getAllCandidates, getResults, VoteReceipt} from "@services";
import {CandidateDetails} from "@models";

type Result = CandidateDetails & { votes: number, votesDetails: VoteReceipt[] };

type CombinedData = {
  topVotes: Result[];
  restVotes: Result[];
}

export const useGetResults = (eventId: string, categoryId: string) => {

  const topVotesLength = 7;

  const {data, isLoading} = useQuery<CombinedData>('combinedData', async () => {
    const [candidates, results] = await Promise.all([
      getAllCandidates(),
      getResults(eventId, categoryId)
    ]);

    const candidatesWithVotes = candidates.map(candidate => {
      return {
      ...candidate.candidate,
        votes: results.candidatesResults[candidate.candidate.id]
          ? results.candidatesResults[candidate.candidate.id].votes * Number(results.candidatesResults[candidate.candidate.id].votingPower)
          : 0,
        votesDetails: results.allVotes.filter((vote) => JSON.parse(vote.payload).data.votes?.includes(candidate.candidate.id)),
      };
    });

    const sorted = [...candidatesWithVotes].sort((a, b) => b.votes - a.votes);

    const topVotes = sorted.slice(0, topVotesLength);

    const restVotes = sorted.slice(topVotesLength);

    return { topVotes, restVotes };
  });

  return {data, isLoading};

}
