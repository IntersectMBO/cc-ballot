import { Address } from "@emurgo/cardano-serialization-lib-asmjs";
import { Buffer } from "buffer";

import { ModalState, Optional } from "@context";
import { CardanoApiWallet } from "@models";
import { StatusModalState } from "@organisms";
import { getSlotNumber, getAccountInfo } from "@services";

export const getPayloadData = async (walletApi: CardanoApiWallet, openModal: (modal: Optional<ModalState<StatusModalState>, "state">) => void) => {
  let slotNumber = 0;
  let stakeAddress: string = '';
  let walletId: string = '';
  let delegated_drep: string | null = null;

  try {
    // @ts-ignore
    slotNumber = (await getSlotNumber())?.absoluteSlot;
    const rewardAddresses = await walletApi.getRewardAddresses();
    stakeAddress = rewardAddresses[0];
    const stakeAddressHex = Address.from_bytes(Buffer.from(rewardAddresses[0], 'hex'));
    walletId = stakeAddressHex.to_bech32();
    delegated_drep = (await getAccountInfo(walletId)).delegated_drep;
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
    delegated_drep,
  };
}
