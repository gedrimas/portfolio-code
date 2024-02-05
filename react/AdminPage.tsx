import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventDaysControl from "./EventDaysControl";
import EventTrainerDesc from "./EventTrainerDesc";
import EventNamePlaces from "./EventNamePlaces";
import { useAppSelector } from "../../reduxApi/hooks";
import {
  selectEventCreationError,
  selectEventCreationSuccess,
  selectEventCreationIsPending,
} from "../../reduxSlices/events/eventsSlise";
import CircularPreloader from "../preloaders/CircularPreloader";
import { selectCurrentCompany } from "../../reduxSlices/company/companySlice";
import { useGetEventsByTokenQuery } from "../../reduxApi/services/api";
import EventsList from "./EventsList";
import { useNavigate } from "react-router-dom";

const AdminPage: React.FC = () => {
  const isPending = useAppSelector(selectEventCreationIsPending);
  const eventCreationError = useAppSelector(selectEventCreationError);
  const eventCreationSuccess = useAppSelector(selectEventCreationSuccess);

  const currentCompany = useAppSelector(selectCurrentCompany);
  const { company_id } = currentCompany;

  const queryOptions = {
    refetchOnMountOrArgChange: true,
  };

  useGetEventsByTokenQuery(company_id, queryOptions);

  const navigate = useNavigate();
  const handelLoginOut = () => {
    navigate("/");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        "& > :not(style)": {
          m: 1,
        },
      }}
    >
      <ArrowBackIcon
        sx={{
          "&.MuiSvgIcon-root": {
            margin: "0px 8px",
            cursor: "pointer",
          },
        }}
        onClick={handelLoginOut}
        fontSize="small"
      />
      <Paper
        elevation={0}
        sx={{
          backgroundColor: "rgb(0 58 117 / 30%)",
          p: 1,
        }}
      >
        <CircularPreloader
          errorMsg={eventCreationError}
          successMsg={eventCreationSuccess}
          isPending={isPending}
        />
        <Box>
          <Grid container spacing={1} alignItems="top">
            <EventNamePlaces />
            <EventTrainerDesc />
            <EventDaysControl />
          </Grid>
        </Box>
      </Paper>
      <EventsList />
    </Box>
  );
};

export default AdminPage;
