import {forwardRef, useState} from "react";
import { CopyBlock, dracula } from "react-code-blocks";

import { ModalWrapper } from "@atoms";
import { Button } from "@atoms";
import { Box, Link, Typography } from "@mui/material";
import {useModal} from "@context";
import { Input } from "@/components/molecules/Field/Input";
import { TextArea } from "@/components/molecules/Field/TextArea";

type VoteCLIModalState = {
  id: string;
  timestamp: number;
  votes: number[];
  cliVote: (jsonStr: string, dRepId: string, id: string, timestamp: number) => void;
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

  const command = `./cardano-signer sign --cip8 --data '{"action":"cast_vote",
  "data": {"event":"${import.meta.env.VITE_EVENT}","category":"${import.meta.env.VITE_CATEGORY}",
  "proposal":"${import.meta.env.VITE_PROPOSAL}",
  "id":"${state?.id}","timestamp":${state?.timestamp},
  "votes":${JSON.stringify(state?.votes)}}}' --secret-key <PROVIDE YOUR SECRET KEY HERE> --address ${data.dRepId} --json`;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setData(prevData => ({...prevData, [event.target.name]: event.target.value}));
  }

  const isdrepId = (drepId: string) => {
    return drepId.indexOf('drep') > -1;
  }

  const validate = () => {
    let err = false;
    setError(errorInit);
    if (step === 1) {
      if (data.dRepId === '' && !isdrepId(data.dRepId)) {
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

  const onSubmit = async () => {
    const err = validate();
    if (err) return;
    if (step === 2) {
      state?.cliVote(data.json, data.dRepId, state?.id, state?.timestamp);
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
