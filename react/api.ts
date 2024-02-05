import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  IEventCreation,
  IEventUpdation,
} from "../../reduxSlices/events/eventsSlise";
import Cookies from "js-cookie";
import { coocie } from "../../accessories/constants";

export interface IEvent {
  id: string;
  event_id: string;
  event: string;
  start: string;
  end: string;
  duration: string[];
  description: string;
  trainer: string;
  places: string;
  day: string;
  company_id: string;
  admin_id: string;
  len: number;
}

export interface ICompanies {
  company: string;
  company_id: string;
}

export interface IEventsResponse {
  Data: IEvent[];
}

export interface ICompaniesResponse {
  Data: ICompanies[];
}

const eventUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/event"
    : "https://api-develop.server.gedrimas.eu1.kubegateway.com/event";

const allEventsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/events"
    : "https://api-develop.server.gedrimas.eu1.kubegateway.com/events";

const allCompaniesUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/companies"
    : "https://api-develop.server.gedrimas.eu1.kubegateway.com/companies";

export const serverApi = createApi({
  reducerPath: "serverApi",
  baseQuery: fetchBaseQuery({
    prepareHeaders: (headers) => {
      const token = Cookies.get(coocie.TOKEN);
      if (token) {
        headers.set("token", `${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createEvent: builder.mutation<IEventsResponse, IEventCreation>({
      query: (event) => ({
        url: eventUrl,
        method: "POST",
        body: event,
      }),
    }),
    getEvents: builder.query<IEventsResponse, string>({
      query: (company_id) => ({
        url: `${allEventsUrl}/${company_id}`,
        method: "GET",
      }),
    }),
    getEventsByToken: builder.query<IEventsResponse, any>({
      query: () => ({
        url: allEventsUrl,
        method: "GET",
      }),
    }),
    getCompanies: builder.query<ICompaniesResponse, void>({
      query: () => ({
        url: allCompaniesUrl,
        method: "GET",
      }),
    }),
    deleteEvent: builder.mutation<IEventsResponse, string>({
      query: (event_id) => ({
        url: `${eventUrl}/${event_id}`,
        method: "DELETE",
      }),
    }),
    updateEvent: builder.mutation<IEventsResponse, IEventUpdation>({
      query: (event) => ({
        url: eventUrl,
        method: "PUT",
        body: event,
      }),
    }),
  }),
});

export const {
  useCreateEventMutation,
  useGetEventsQuery,
  useGetEventsByTokenQuery,
  useGetCompaniesQuery,
  useDeleteEventMutation,
  useUpdateEventMutation,
} = serverApi;
