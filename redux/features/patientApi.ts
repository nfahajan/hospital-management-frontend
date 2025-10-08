import { api } from "../api/api";
import { tagTypes } from "../tabTypesList";
import {
  type CreatePatientData,
  type UpdatePatientData,
  type Patient,
  type PatientFilters,
  type PatientResponse,
  type PatientApiResponse,
  type PatientsApiResponse,
} from "@/types/patient";

export const patientApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Public route - Register a new patient
    registerPatient: builder.mutation<PatientApiResponse, CreatePatientData>({
      query: (data) => ({
        url: "/patients/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: tagTypes.patient, id: "LIST" }],
    }),

    // Protected routes - Authentication required
    getMyProfile: builder.query<PatientApiResponse, void>({
      query: () => "/patients/me",
      providesTags: [{ type: tagTypes.patient, id: "MY_PROFILE" }],
    }),

    updateMyProfile: builder.mutation<PatientApiResponse, UpdatePatientData>({
      query: (data) => ({
        url: "/patients/me",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.patient, id: "MY_PROFILE" },
        { type: tagTypes.patient, id: "LIST" },
      ],
    }),

    // Admin only routes
    getAllPatients: builder.query<PatientsApiResponse, PatientFilters>({
      query: (params) => ({
        url: "/patients",
        params,
      }),
      providesTags: [{ type: tagTypes.patient, id: "LIST" }],
    }),

    getPatientById: builder.query<PatientApiResponse, string>({
      query: (id) => `/patients/${id}`,
      providesTags: [{ type: tagTypes.patient, id: "DETAIL" }],
    }),

    updatePatient: builder.mutation<
      PatientApiResponse,
      { id: string; data: UpdatePatientData }
    >({
      query: ({ id, data }) => ({
        url: `/patients/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.patient, id: "LIST" },
        { type: tagTypes.patient, id: "DETAIL" },
        { type: tagTypes.patient, id: "MY_PROFILE" },
      ],
    }),

    deletePatient: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/patients/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: tagTypes.patient, id: "LIST" },
        { type: tagTypes.patient, id: "DETAIL" },
      ],
    }),
  }),
});

export const {
  useRegisterPatientMutation,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGetAllPatientsQuery,
  useGetPatientByIdQuery,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = patientApi;
