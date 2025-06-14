import Box from "@mui/material/Box";
import { Input } from "@/components/molecules/Field/Input";
import { TextArea } from "@/components/molecules/Field/TextArea";

import { useRegisterFormContext } from "@hooks";

export const FormStep6 = () => {
  const { candidateType, data, handleChange } = useRegisterFormContext();
  return (
    <Box sx={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <TextArea
        id="reasonToServe"
        label={'Why do you wish to serve on the Constitutional Committee?'}
        name="reasonToServe"
        onChange={handleChange}
        value={data.reasonToServe}
      />
      <TextArea
        id="governanceExperience"
        label={'Describe your experience with Cardano governance or blockchain governance in general'}
        name="governanceExperience"
        onChange={handleChange}
        value={data.governanceExperience}
      />
      <TextArea
        id="communicationStrategy"
        label={'How will you communicate with the Cardano community about your decision making?'}
        name="communicationStrategy"
        onChange={handleChange}
        value={data.communicationStrategy}
      />
      <TextArea
        id="ecosystemContributions"
        label={'Cardano Ecosystem Contributions'}
        name="ecosystemContributions"
        onChange={handleChange}
        value={data.ecosystemContributions}
      />
      <TextArea
        id="legalExpertise"
        label={'Do you have any expertise in constitutional law or law in general? If so please describe'}
        name="legalExpertise"
        onChange={handleChange}
        value={data.legalExpertise}
      />
      {candidateType === 'individual' && (
        <Input
          id="weeklyCommitmentHours"
          label={'Estimate the average number of hours per week you can dedicate to the committee'}
          name="weeklyCommitmentHours"
          onChange={handleChange}
          value={data.weeklyCommitmentHours}
        />
      )}
    </Box>
  );
}
