import {CardanoApiWallet} from "@models";
import {getAccountInfo, getSlotNumber} from "@/services/requests/voteService.ts";
import {Address} from "@emurgo/cardano-serialization-lib-asmjs";
import {Buffer} from "buffer";

export const getPayloadData = async (walletApi: CardanoApiWallet, errorAlert: (message: string, autoHideDuration?: number) => void) => {
  let slotNumber = 0;
  let stakeAddress: string = '';
  let walletId: string = '';
  let votingPower = 0;

  try {
    // @ts-ignore
    slotNumber = (await getSlotNumber())?.absoluteSlot;
    const rewardAddresses = await walletApi.getRewardAddresses();
    stakeAddress = rewardAddresses[0];
    const stakeAddressHex = Address.from_bytes(Buffer.from(rewardAddresses[0], 'hex'));
    walletId = stakeAddressHex.to_bech32();
    const total_balance = Number((await getAccountInfo(stakeAddressHex.to_bech32()))?.total_balance);
    votingPower = Math.floor(total_balance/1000000);
  } catch (err: any) {
    console.error(err);
    errorAlert(err.message);
  }

  return {
    slotNumber,
    stakeAddress,
    walletId,
    votingPower,
  };
}
