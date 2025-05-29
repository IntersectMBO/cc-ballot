import axios from "axios";

export interface ChainTip {
  absoluteSlot: number;
  hash: string;
  epochNo: number;
  network: "MAIN" | "PREPROD";
  synced: boolean;
}

export interface SignedWeb3Request {
  signature: string;
  key?: string;
}

export const getSlotNumber = async () => {
  try {
    const response =  await axios.get<ChainTip>(`http://localhost:9090/api/blockchain/tip`, {
      headers: {
        "accept": "application/json",
      }
    });

    return response.data;
  }
  catch (error) {
    console.error(`Unknown error processing request to ${import.meta.env.VOTING_LEDGER_FOLLOWER_APP_SERVER_URL}/api/blockchain/tip`);
    return {
      error: true,
      message: "An unknown error occurred",
      status: 500,
    };
  }
}

export const submitVote = async (
  signed: SignedWeb3Request,
  payloadStr: string,
) => {
  try {
    const response =  await axios.post(`http://localhost:9091/api/vote/candidate/cast`, undefined, {
      headers: {
        "Content-Type": "application/json",
        "X-Ballot-Signature": signed.signature,
        "X-Ballot-Payload": payloadStr,
        "X-Ballot-Public-Key": signed.key,
        "X-Ballot-Wallet-Type": "CARDANO",
      }
    });

    return response.data;
  }
  catch (error) {
    console.error(error);
    return {
      error: true,
      message: "An unknown error occurred",
      status: 500,
    };
  }
}

export const getVoteReceipt = async (
  signed: SignedWeb3Request,
  payloadStr: string,
) => {
  try {
    const response =  await axios.get(`http://localhost:9091/api/vote/candidate/receipt`, {
      headers: {
        "Content-Type": "application/json",
        "X-Ballot-Signature": signed.signature,
        "X-Ballot-Payload": payloadStr,
        "X-Ballot-Public-Key": signed.key,
        "X-Ballot-Wallet-Type": "CARDANO",
      }
    });

    return response.data;
  }
  catch (error) {
    console.error(error);
    return {
      error: true,
      message: "An unknown error occurred",
      status: 500,
    };
  }
}
