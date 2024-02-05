import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../../reduxApi/services/auth";
import type { RootState } from "../../reduxApi/store";
import { getErrorResponseCustomType } from "../../accessories/typeGuards";
import Cookies from "js-cookie";
import { coocie } from "../../accessories/constants";

type AuthState = {
  token: string;
  user_id: string;
  username: string;
  user_type: string;
  company_id: null | string;
  error: null | string;
  isPending: boolean;
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: "",
    user_id: "",
    username: "",
    user_type: "",
    company_id: null,
    events_to_go: null,
    error: null,
    isPending: false,
  } as AuthState,
  reducers: {
    dropErrorMsg: (state) => {
      state.error = "";
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    setCompanyId: (state, action: PayloadAction<string>) => {
      state.company_id = action.payload
    },
    setUserType: (state, action: PayloadAction<string>) => {
      state.user_type = action.payload
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.username = action.payload
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.user_id = action.payload
    }

  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          const { token, user_type, company_id, username, user_id } = payload.Data;
          Cookies.set(coocie.TOKEN, token, { expires: 30 });
          state.token = token;
          state.username = username;
          state.user_type = user_type;
          state.company_id = company_id;
          state.user_id = user_id;
          state.isPending = false;
        }
      )
      .addMatcher(
        authApi.endpoints.login.matchRejected,
        (state, { payload }) => {
          if (payload) {
            const data = payload.data;
            if (getErrorResponseCustomType(data)) {
              state.error = data.Message;
              state.isPending = false;
            }
          }
        }
      )
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.isPending = true;
      })
      .addMatcher(
        authApi.endpoints.adminRegistretion.matchFulfilled,
        (state, { payload }) => {
          const { token, user_type, company_id } = payload.Data;
          Cookies.set(coocie.TOKEN, token, { expires: 30 });
          state.user_type = user_type;
          state.company_id = company_id;
          state.isPending = false;
        }
      )
      .addMatcher(
        authApi.endpoints.adminRegistretion.matchRejected,
        (state, { payload }) => {
          if (payload) {
            const data = payload.data;
            if (getErrorResponseCustomType(data)) {
              state.error = data.Message;
              state.isPending = false;
            }
          }
        }
      )
      .addMatcher(authApi.endpoints.adminRegistretion.matchPending, (state) => {
        state.isPending = true;
      })
      .addMatcher(
        authApi.endpoints.userRegistretion.matchFulfilled,
        (state, { payload }) => {
          const { token, username, user_type, user_id } = payload.Data;
          Cookies.set(coocie.TOKEN, token, { expires: 30 });
          state.username = username,
          state.user_type = user_type;
          state.user_id = user_id;
          state.token = token,
          state.isPending = false;
        }
      )
      .addMatcher(
        authApi.endpoints.userRegistretion.matchRejected,
        (state, { payload }) => {
          if (payload) {
            const data = payload.data;
            if (getErrorResponseCustomType(data)) {
              state.error = data.Message;
              state.isPending = false;
            }
          }
        }
      )
      .addMatcher(authApi.endpoints.userRegistretion.matchPending, (state) => {
        state.isPending = true;
      });
  },
});

export const { dropErrorMsg, setToken, setCompanyId, setUserType, setUserName, setUserId } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentCompany = (state: RootState) => state.auth.company_id;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthIsPending = (state: RootState) => state.auth.isPending;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectUserType = (state: RootState) => state.auth.user_type;
export const selectUserName = (state: RootState) => state.auth.username;
export const selectUserId = (state: RootState) => state.auth.user_id;


