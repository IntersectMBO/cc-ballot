import {CardanoApiWallet} from "@models";
import {getAccount, getSlotNumber} from "@services";
import {Address} from "@emurgo/cardano-serialization-lib-asmjs";
import {Buffer} from "buffer";
import { ModalState, Optional } from "@context";
import { StatusModalState } from "@organisms";

export const getPayloadData = async (walletApi: CardanoApiWallet, event: string, walletType: string, openModal: (modal: Optional<ModalState<StatusModalState>, "state">) => void) => {
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
    votingPower = Number((await getAccount(event, walletType, walletId)).votingPower);
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
          title: "Error",
          message: error.message,
          dataTestId: "error-modal",
        },
      });
    }
  }

  return {
    slotNumber,
    stakeAddress,
    walletId,
    votingPower,
  };
}
