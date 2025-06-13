import {forwardRef, useState} from "react";
import { CopyBlock, dracula } from "react-code-blocks";

import { ModalWrapper } from "@atoms";
import { Button } from "@atoms";
import { Box, Link, Typography } from "@mui/material";
import {useModal} from "@context";
import { Input } from "@/components/molecules/Field/Input";
import { TextArea } from "@/components/molecules/Field/TextArea";
import {getSlotNumber, SignedWeb3Request, submitVote} from "@services";

type VoteCLIModalState = {
  id: string;
  timestamp: number;
  votes: number[];
}

export const VoteCLIModal = forwardRef<HTMLDivElement>((_, ref) => {
  const errorInit = {
    dRepKey: false,
    dRepId: false,
    json: false,
  };

  const { state, closeModal } = useModal<VoteCLIModalState>();
  const [ step, setStep ] = useState(1);
  const [data, setData] = useState({
    dRepKey: '',
    dRepId: '',
    json: '',
  });
  const [error, setError ] = useState(errorInit)

  const command = `./cardano-signer sign --cip8 --data '{"action":"cast_vote",
  "data": {"event":"${import.meta.env.VITE_EVENT}","category":"${import.meta.env.VITE_CATEGORY}",
  "proposal":"${import.meta.env.VITE_PROPOSAL}",
  "id":"${state?.id}","timestamp":${state?.timestamp},
  "votes":${JSON.stringify(state?.votes)}}}' --secret-key ${data.dRepKey} --address ${data.dRepId} --json`

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setData(prevData => ({...prevData, [event.target.name]: event.target.value}));
  }

  const validate = () => {
    let err = false;
    setError(errorInit);
    if (step === 1) {
      if (data.dRepId === '') {
        err = true;
        setError(prevError => ({...prevError, dRepId: true}));
      }
      if (data.dRepKey === '') {
        err = true;
        setError(prevError => ({...prevError, dRepKey: true}));
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

  const onSubmit = async () => {
    const err = validate();
    if (err) return;
    if (step === 2) {
      try {
        const json = JSON.parse(data.json);

        const slotNumber = (await getSlotNumber())?.absoluteSlot;

        const payload = {
          action: 'cast_vote',
          slot: slotNumber,
          data: {
            event: import.meta.env.VITE_EVENT,
            category: import.meta.env.VITE_CATEGORY,
            proposal: import.meta.env.VITE_PROPOSAL,
            id: state?.id,
            votedAt: slotNumber,
            timestamp: state?.timestamp,
            walletId: data.dRepId,
            walletType: import.meta.env.VITE_WALLET_TYPE,
            network: import.meta.env.VITE_TARGET_NETWORK,
            votes: state?.votes,
          }
        };

        const signed: SignedWeb3Request = {
          key: json.COSE_Key_hex,
          signature: json.COSE_Sign1_hex,
        };

        const payloadStr = JSON.stringify(payload);

        console.log('signed', signed);
        console.log('payload', payload);

        await submitVote(signed, payloadStr, import.meta.env.VITE_WALLET_TYPE);

        console.log('success');
      } catch (error: any) {
        console.error(error);
      }
    }
    if (step !== 2) {
      setStep(prevVal => prevVal + 1);
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
        <Typography variant="h1">Vote using a Command-Line Interface</Typography>
        <Typography variant="body1">
          Copy the following vote metadata and use it as a payload to submit a transaction using <Link variant="body1" target="_blank" rel="noopener" href="https://github.com/IntersectMBO/cc-ballot/tree/cc-elections-2025/cli/cc-ballot-cli">CLI tool</Link>
        </Typography>
      </Box>
      {step === 1 && (
        <Box sx={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input
            errorMessage={error.dRepKey ? 'Error' : ''}
            label="DRep Key"
            name="dRepKey"
            onChange={handleChange}
            value={data.dRepKey}
          />
          <Input
            errorMessage={error.dRepId ? 'Error' : ''}
            label="DRep Id"
            name="dRepId"
            onChange={handleChange}
            value={data.dRepId}
          />
        </Box>
      )}
      {step === 2 && data.dRepKey !== '' && data.dRepId !== '' && (
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
            errorMessage={error.json ? 'Error' : ''}
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
