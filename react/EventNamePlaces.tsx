import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import React, { useId } from "react";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import FaceIcon from "@mui/icons-material/Face";
import {
  setEventName,
  setEventNameInputStatus,
  setPlaces,
  setPlacesInputStatus,
} from "../../reduxSlices/events/eventsSlise";
import EventDateTime from "./EventDateTime";
import { useAppSelector, useAppDispatch } from "../../reduxApi/hooks";
import {
  selectEventNameInputStatus,
  selectEventName,
  selectPlaces,
  selectPlacesInputStatus,
} from "../../reduxSlices/events/eventsSlise";
import { InputValidator } from "../../accessories/inputValiadation";
import { inputValNames } from "../../accessories/constants";
import FormHelperText from "@mui/material/FormHelperText/FormHelperText";

const EventNameDatePlaces: React.FC = () => {
  const dispatch = useAppDispatch();

  const eventName = useAppSelector(selectEventName);
  const inputCheck = useAppSelector(selectEventNameInputStatus);
  const helperText = InputValidator.helperText(inputCheck);

  const handelEventName = (val: string) => {
    const checkInput = new InputValidator(val, inputValNames.EVENT_NAME).getResult();
    dispatch(setEventName(val));
    if (checkInput.isValid) {
      dispatch(setEventNameInputStatus(checkInput));
    }
  };

  const places = useAppSelector(selectPlaces);
  const placesCheck = useAppSelector(selectPlacesInputStatus);

  const handlePlaces = (event: SelectChangeEvent) => {
    let val = event.target.value;
    const checkPlaces = new InputValidator(val, inputValNames.PLACES).getResult();
    dispatch(setPlaces(val));
    if (checkPlaces.isValid) {
      dispatch(setPlacesInputStatus(checkPlaces));
    }
  };

  const menuItems = () => {
    let items = [];
    for (let i = 1; i <= 30; i++) {
      items.push(
        <MenuItem value={`${i}`} key={useId()}>
          {i}
        </MenuItem>
      );
    }
    return items;
  };

  const onBlurHandler = () => {
    const eventNameInput = new InputValidator(
      eventName,
      inputValNames.EVENT_NAME
    ).getResult();
    if (!eventNameInput.isValid) {
      dispatch(setEventNameInputStatus(eventNameInput));
    }
  };

  return (
    <Grid item md={4} sm={12}>
      <TextField
        id="event"
        label="Event Name"
        variant="outlined"
        fullWidth
        margin="dense"
        value={eventName}
        onChange={(event) => handelEventName(event.target.value)}
        error={!inputCheck.isValid}
        helperText={helperText || " "}
        onBlur={onBlurHandler}
      />
      <EventDateTime />
      <Stack
        useFlexGap
        direction="row"
        spacing={{ xs: 1, sm: 5, md: 2 }}
        divider={<Divider orientation="vertical" flexItem />}
        justifyContent="center"
        sx={{
          pt: 1,
        }}
      >
        <FormControl error={!placesCheck.isValid}>
          <InputLabel id="places-select-label">Places</InputLabel>
          <Select
            key={useId()}
            labelId="places-select-label"
            id="places-select"
            value={places}
            label="Age"
            onChange={handlePlaces}
            sx={{
              width: 120,
            }}
            onBlur={console.log}
          >
            {menuItems()}
          </Select>
          {!placesCheck.isValid && (
            <FormHelperText>Required</FormHelperText>
          )}
        </FormControl>
        <Chip
          sx={{
            backgroundColor: "#0072E5",
            mt: 1,
          }}
          icon={<FaceIcon />}
          label="5 / 10 will go"
        />
      </Stack>
    </Grid>
  );
};

export default EventNameDatePlaces;
