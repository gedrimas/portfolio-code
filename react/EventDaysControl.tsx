import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import RepeatButtons from "./RepeatButtons"
import ControlButtons from "./ControlButtons"

const EventDaysControl: React.FC = () => {
    return (
        <Grid item md={4} sm={12}>
        <Stack
          useFlexGap
          direction="row"
          spacing={{ xs: 1, sm: 5, md: 2 }}
          divider={<Divider orientation="vertical" flexItem />}
          justifyContent="space-evenly"
          sx={{
            pt: 1,
          }}
        >
          <RepeatButtons />
          <ControlButtons />
        </Stack>
      </Grid>
    )
}

export default EventDaysControl