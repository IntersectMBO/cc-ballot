import {forwardRef, useState} from "react";
import { CopyBlock, dracula } from "react-code-blocks";
import { bech32 } from 'bech32';

import { ModalWrapper } from "@atoms";
import { Button } from "@atoms";
import { Box, Link, Typography } from "@mui/material";
import {useModal} from "@context";
import { Input } from "@/components/molecules/Field/Input";
import { TextArea } from "@/components/molecules/Field/TextArea";
import { getSlotNumber } from "@services";

type VoteCLIModalState = {
  id: string;
  timestamp: number;
  votes: number[];
  cliVote: (jsonStr: string, dRepId: string, id: string, timestamp: number, slotNumber: number) => void;
}

export const VoteCLIModal = forwardRef<HTMLDivElement>((_, ref) => {
  const errorInit = {
    dRepId: false,
    json: false,
  };

  const { state, closeModal } = useModal<VoteCLIModalState>();
  const [ step, setStep ] = useState(1);
  const [data, setData] = useState({
    dRepId: '',
    json: '',
  });
  const [error, setError] = useState(errorInit);
  const [slotNumber, setSlotNumber] = useState(0);

  const command = `./cardano-signer sign --cip8 --data '{"action":"cast_vote", "slot": ${slotNumber},
  "data": {"event":"${import.meta.env.VITE_EVENT}","category":"${import.meta.env.VITE_CATEGORY}",
  "proposal":"${import.meta.env.VITE_PROPOSAL}",
  "id":"${state?.id}", "votedAt": ${slotNumber}, "timestamp":${state?.timestamp},
  "walletId":"${data.dRepId}",
  "walletType":"${import.meta.env.VITE_WALLET_TYPE}","network":"${import.meta.env.VITE_TARGET_NETWORK}"
  "votes":${JSON.stringify(state?.votes)}}}' --secret-key <PROVIDE YOUR SECRET KEY HERE> --address ${data.dRepId} --json`;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setData(prevData => ({...prevData, [event.target.name]: event.target.value}));
  }

  const checkDrepId = (drepId: string) => {
    try {
      // 1. Decode Bech32
      const decoded = bech32.decode(drepId);
      if (decoded.prefix !== 'drep') {
        return { valid: false, error: 'Invalid prefix: expected "drep"' };
      }

      // 2. Convert from 5-bit words to 8-bit bytes
      const bytes = bech32.fromWords(decoded.words);

      // 3. Check length: must be 28 bytes (Blake2b-224)
      if (bytes.length !== 28) {
        return { valid: false, error: `Invalid length: expected 28 bytes while got ${bytes.length}` };
      }

      return { valid: true };
    } catch (err) {
      return { valid: false, error: 'Invalid Bech32-encoded DRep ID.' };
    }
  }

  const validate = () => {
    let err = false;
    setError(errorInit);
    if (step === 1) {
      const isValidDrepId = checkDrepId(data.dRepId);
      if (data.dRepId === '' || !isValidDrepId.valid) {
        err = true;
        setError(prevError => ({...prevError, dRepId: true}));
      }
    }
    if (step === 2) {
      if (data.json === '') {
        err = true;
        setError(prevError => ({...prevError, json: true}));
      }
      if (data.json !== '') {
        try {
          JSON.parse(data.json);
        } catch (e) {
          err = true;
          setError(prevError => ({...prevError, json: true}));
        }
      }
    }
    return err;
  }

  const genereteSlot = async () => {
    const slot = (await getSlotNumber())?.absoluteSlot;

    setSlotNumber(slot);
  }

  const onSubmit = async () => {
    const err = validate();
    if (err) return;
    if (step === 1) {
      await genereteSlot();
      setStep(prevVal => prevVal + 1);
    }
    if (step === 2) {
      state?.cliVote(data.json, data.dRepId, state?.id, state?.timestamp, slotNumber);
    }
  }

  return (
    <ModalWrapper
      dataTestId={ "voting-modal"}
      hideCloseButton={true}
      ref={ref}
      sx={{ padding: { md: '32px 40px' }, minWidth: { lg: '800px' } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <Typography variant="h1">Vote using CLI and Cardano Signer</Typography>
        {step === 1 ? (
          <Typography variant="body1">
            Provide your DRep ID below to get the <Link variant="body1" target="_blank" rel="noopener" href="https://github.com/gitmachtl/cardano-signer">cardano-signer</Link> command to execute on your computer.
          </Typography>
        ) : (
          <Typography variant="body1">
            Copy the command, adjust it with your secret key, execute it on your computer using the <Link variant="body1" target="_blank" rel="noopener" href="https://github.com/gitmachtl/cardano-signer">cardano-signer</Link> tool, and paste the output below to cast your vote.
          </Typography>
        )}
      </Box>
      {step === 1 ? (
        <Box sx={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input
            errorMessage={error.dRepId ? 'Enter a valid DRep ID' : ''}
            label="(CIP-105) DRep ID"
            name="dRepId"
            onChange={handleChange}
            value={data.dRepId}
          />
        </Box>
      ) : (
        <Box sx={{ padding: '16px 0' }}>
          <CopyBlock
            language={'JavaScript'}
            text={command}
            showLineNumbers={true}
            theme={dracula}
            customStyle={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowX: "auto",
            }}
          />
          <TextArea
            errorMessage={error.json ? 'Enter a valid JSON' : ''}
            label={'JSON result'}
            name="json"
            onChange={handleChange}
            value={data.json}
          />
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px' }}>
        <Button
          variant="outlined"
          onClick={closeModal}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
        >
          Next
        </Button>
      </Box>
    </ModalWrapper>
  )
});
