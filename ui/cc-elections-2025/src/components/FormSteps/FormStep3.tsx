import Box from "@mui/material/Box";
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from "@mui/material/Typography";

import { useRegisterFormContext } from "@hooks";

type FormStep3Props = {
  disabled: boolean;
}

export const FormStep3 = ({ disabled }: FormStep3Props) => {
  const { candidateType, setCandidateType, error } = useRegisterFormContext();

  return (
    <FormControl error={error['candidateType']}>
      <RadioGroup name="candidateType" value={candidateType} onChange={(event) => {
        setCandidateType(event.target.value as "individual" | "company" | "consortium");
      }}>
        <Box sx={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Box sx={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0px 20px 25px -5px #212A3D14', padding: '16px' }}>
            <FormControlLabel value="individual" disabled={disabled} control={<Radio />} label={'Individual candidate'} />
            <Typography variant="body2" sx={{ marginLeft: '31px' }}>Select this option if you are applying as a single person.</Typography>
          </Box>
          <Box sx={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0px 20px 25px -5px #212A3D14', padding: '16px' }}>
            <FormControlLabel value="company" disabled={disabled} control={<Radio />} label={'Company'} />
            <Typography variant="body2" sx={{ marginLeft: '31px' }}>Select this option if you are applying on behalf of a single, registered business or organization.</Typography>
          </Box>
          <Box sx={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0px 20px 25px -5px #212A3D14', padding: '16px' }}>
            <FormControlLabel value="consortium" disabled={disabled} control={<Radio />} label={'Consortium'} />
            <Typography variant="body2" sx={{ marginLeft: '31px' }}>Choose this if you are applying as a collaborative group made up of multiple distinct individuals and/or organizations.</Typography>
          </Box>
        </Box>
        {error['candidateType'] && <FormHelperText>Please select an option</FormHelperText>}
      </RadioGroup>
    </FormControl>
  );
}
