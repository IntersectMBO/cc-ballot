import { useQuery } from "react-query";
import { getVoteReceipt } from "@services";

export const useGetVoteReceipt = (signed: { signature: string, key?: string }, payloadStr: string) => {
  const { data, isLoading } = useQuery(
    ['voteReceipt', signed, payloadStr],
    () => getVoteReceipt(signed, payloadStr),
    {
      refetchOnMount: true,
    }
  );

  return {
    isVoteReceiptLoading: isLoading,
    voteRecept: data,
  };
}
