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

export interface Account {
  walletType: string;
  walletId: string;
  epochNo: number;
  votingPower: string;
  votingPowerAsset: string;
  network: string;
}

export interface AccountInfo {
  stake_address: string;
  status: string;
  delegated_pool: string;
  delegated_drep: string;
  total_balance: string;
  utxo: string;
  rewards: string;
  withdrawals: string;
  rewards_available: string;
  deposit: string;
  reserves: string;
  treasury: string;
  proposal_refund: string;
}

export interface VoteReceipt {
  id: string;
  event: string;
  category: string;
  votingPower: string;
  walletId: string;
  walletType: string;
  proposal: string;
  signature: string;
  payload: string;
  publicKey: string;
  status?: string;
  finalityScore?: string | null;
  votedAtSlot: string;
}

const VOTING_LEDGER_FOLLOWER_APP_URL = import.meta.env.VITE_VOTING_LEDGER_FOLLOWER_APP_URL;
const VOTING_APP_URL = import.meta.env.VITE_VOTING_APP_URL;
const ACCOUNT_INFO_URL = import.meta.env.VITE_ACCOUNT_INFO_URL;

export const getSlotNumber = async () => {
  const response =  await axios.get<ChainTip>(`${VOTING_LEDGER_FOLLOWER_APP_URL}/api/blockchain/tip`, {
    headers: {
      "accept": "application/json",
    }
  });

  return response.data;
}

export const getAccount = async (
  eventId: string,
  walletType: string,
  walletId: string,
) => {
  const response =  await axios.get<Account>(`${VOTING_LEDGER_FOLLOWER_APP_URL}/api/account/${eventId}/${walletType}/${walletId}`);

  return response.data;
}

export const submitVote = async (
  signed: SignedWeb3Request,
  payloadStr: string,
) => {
  const response =  await axios.post(`${VOTING_APP_URL}/api/vote/candidate/cast`, undefined, {
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

export const getAccountInfo = async (
  walletId: string,
) => {
  const response =  await axios.get<AccountInfo>(`${ACCOUNT_INFO_URL}/api/account-info?stakeAddress=${walletId}`)

  return response.data;
}

export const getVoteReceipt = async (
  signed: SignedWeb3Request,
  payloadStr: string,
) => {
  const response = await axios.get<VoteReceipt>(`${VOTING_APP_URL}/api/vote/candidate/receipt`, {
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
