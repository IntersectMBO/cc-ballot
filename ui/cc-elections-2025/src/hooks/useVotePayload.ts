import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import {
  Address,
} from "@emurgo/cardano-serialization-lib-asmjs";

import { getSlotNumber, getAccountInfo } from "@/services/requests/voteService.ts";
import { CardanoApiWallet } from "@models";

export const useVotePayload = (walletApi: CardanoApiWallet) => {
  const [slotNumber, setSlotNumber] = useState<number>(0);
  const [stakeAddress, setStakeAddress] = useState<string>("");
  const [walletId, setWalletId] = useState<string>("");
  const [votingPower, setVotingPower] = useState<number>(0);

  useEffect(() => {
    if (!walletApi) return;
    const getWalletData = async () => {
      try {
        // @ts-ignore
        const absoluteSlot = (await getSlotNumber())?.absoluteSlot;
        const rewardAddresses = await walletApi.getRewardAddresses();
        const stakeAddressHex = Address.from_bytes(Buffer.from(rewardAddresses[0], 'hex'));
        const total_balance = Number((await getAccountInfo(stakeAddressHex.to_bech32()))?.total_balance);

        setSlotNumber(absoluteSlot);
        setStakeAddress(rewardAddresses[0]);
        setWalletId(stakeAddressHex.to_bech32());
        setVotingPower(total_balance/1000000);
      } catch (err) {
        console.error(err);
      }
    }

    getWalletData();
  }, [walletApi]);

  return { slotNumber, stakeAddress, walletId, votingPower };

}
