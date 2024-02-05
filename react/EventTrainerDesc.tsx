import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import {
  setTrainer,
  setDescription,
  setTrainerInputStatus,
  selectTrainer,
  selectTrainerInputStatus,
  setDescriptionInputStatus,
  selectDescriptionInputStatus,
  selectDescription,
} from "../../reduxSlices/events/eventsSlise";
import { useAppSelector, useAppDispatch } from "../../reduxApi/hooks";
import { InputValidator } from "../../accessories/inputValiadation";
import {inputValNames} from '../../accessories/constants'

const EventTreinerDesc: React.FC = () => {
  const dispatch = useAppDispatch();

  const trainerName = useAppSelector(selectTrainer);
  const trainerInputCheck = useAppSelector(selectTrainerInputStatus);
  const trainerHalperText = InputValidator.helperText(trainerInputCheck);

  const handelTrainerName = (val: string) => {
    dispatch(setTrainer(val));
    const checkInput = new InputValidator(val, inputValNames.TRAINER_NAME).getResult();
    if (checkInput.isValid) {
      dispatch(setTrainerInputStatus(checkInput));
    }
  };

  const handleTrainerOnBlur = () => {
    const trainerInput = new InputValidator(
      trainerName,
      inputValNames.TRAINER_NAME
    ).getResult();
    if (!trainerInput.isValid) {
      dispatch(setTrainerInputStatus(trainerInput));
    }
  };

  let description = useAppSelector(selectDescription);
  const descriptionInputCheck = useAppSelector(selectDescriptionInputStatus);
  const descriptionHalperText = InputValidator.helperText(
    descriptionInputCheck
  );

  const handelDescription = (val: string) => {
    dispatch(setDescription(val));
    const checkInput = new InputValidator(val, inputValNames.DESCRIPTION).getResult();
    if (checkInput.isValid) {
      dispatch(setDescriptionInputStatus(checkInput));
    }
  };

  const handleDescriptionOnBlur = () => {
    const descriptionInput = new InputValidator(
      description,
      inputValNames.DESCRIPTION
    ).getResult();
    if (!descriptionInput.isValid) {
      dispatch(setDescriptionInputStatus(descriptionInput));
    }
  };


  return (
    <Grid item md={4} sm={12}>
      <TextField
        id="trainer"
        label="Trainer"
        variant="outlined"
        fullWidth
        margin="dense"
        value={trainerName}
        onChange={(e) => handelTrainerName(e.target.value)}
        helperText={trainerHalperText || " "}
        onBlur={handleTrainerOnBlur}
        error={!trainerInputCheck.isValid}
      />
      <TextField
        id="description"
        label="Event description, contacts, etc"
        variant="outlined"
        margin="dense"
        minRows={4}
        multiline
        fullWidth
        value={description}
        onChange={(e) => handelDescription(e.target.value)}
        helperText={descriptionHalperText}
        onBlur={handleDescriptionOnBlur}
        error={!descriptionInputCheck.isValid}
      />
    </Grid>
  );
};

export default EventTreinerDesc;
