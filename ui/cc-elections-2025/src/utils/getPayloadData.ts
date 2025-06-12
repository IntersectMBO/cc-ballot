import { PublicKey } from "@emurgo/cardano-serialization-lib-asmjs";

import { ModalState, Optional } from "@context";
import { StatusModalState } from "@organisms";
import { getSlotNumber } from "@services";

export const getPayloadData = async (pubDRepKey: string, openModal: (modal: Optional<ModalState<StatusModalState>, "state">) => void) => {
  let slotNumber = 0;
  let walletId: string = '';

  try {
    slotNumber = (await getSlotNumber())?.absoluteSlot;
    const cip105dRepID = (PublicKey.from_hex(pubDRepKey)).hash();
    walletId = cip105dRepID.to_bech32('drep');
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
    walletId,
  };
}
