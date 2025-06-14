import { useQuery } from "react-query";

import { getAllCandidates } from "@services";

export const useGetAllCandidates = () => {

  const { data, isLoading } = useQuery(
    'allCandidates',
    getAllCandidates,
    {
      refetchOnMount: true,
    },
  );

  return {
    isAllCandidatesLoading: isLoading,
    allCandidates: data,
  };
}
