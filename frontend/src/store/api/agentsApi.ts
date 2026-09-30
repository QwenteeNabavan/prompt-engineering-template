import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '@/lib/config'
import type {
  Category,
  AgentListItem,
  AgentDetail,
  UpvoteResponse,
  SubmissionPayload,
  SubmissionResponse,
  Collection,
  ComparisonMatrixResponse,
  Review,
  ReviewCreateInput,
} from '@/types/agent'

export const agentsApi = createApi({
  reducerPath: 'agentsApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Agent', 'Category', 'Collection', 'Review'],
  endpoints: (builder) => ({
    listCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    listAgents: builder.query<
      AgentListItem[],
      {
        q?: string
        category?: string
        runtime?: string
        monetization?: string
        sort?: string
      } | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.q) searchParams.set('q', params.q)
        if (params?.category && params.category !== 'all')
          searchParams.set('category', params.category)
        if (params?.runtime && params.runtime !== 'all')
          searchParams.set('runtime', params.runtime)
        if (params?.monetization && params.monetization !== 'all')
          searchParams.set('monetization', params.monetization)
        if (params?.sort) searchParams.set('sort', params.sort)

        const qs = searchParams.toString()
        return `/agents${qs ? `?${qs}` : ''}`
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Agent' as const, id })),
              { type: 'Agent', id: 'LIST' },
            ]
          : [{ type: 'Agent', id: 'LIST' }],
    }),
    getAgent: builder.query<AgentDetail, string>({
      query: (slug) => `/agents/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Agent', id: slug }],
    }),
    getAlternatives: builder.query<AgentListItem[], string>({
      query: (slug) => `/agents/${slug}/alternatives`,
    }),
    toggleUpvote: builder.mutation<
      UpvoteResponse,
      { agentId: string; fingerprint?: string }
    >({
      query: ({ agentId, fingerprint }) => ({
        url: `/agents/${agentId}/upvote`,
        method: 'POST',
        body: { digital_fingerprint_hash: fingerprint },
      }),
      invalidatesTags: [{ type: 'Agent', id: 'LIST' }],
    }),
    submitAgent: builder.mutation<SubmissionResponse, SubmissionPayload>({
      query: (body) => ({
        url: '/submissions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Agent', id: 'LIST' }],
    }),
    listCollections: builder.query<Collection[], void>({
      query: () => '/collections',
      providesTags: ['Collection'],
    }),
    getCollection: builder.query<Collection, string>({
      query: (slug) => `/collections/${slug}`,
      providesTags: (_result, _error, slug) => [
        { type: 'Collection', id: slug },
      ],
    }),
    compareAgents: builder.query<ComparisonMatrixResponse, string[]>({
      query: (slugs) => `/collections/compare/matrix?agents=${slugs.join(',')}`,
    }),
    listReviews: builder.query<Review[], string>({
      query: (slug) => `/agents/${slug}/reviews`,
      providesTags: (_result, _error, slug) => [{ type: 'Review', id: slug }],
    }),
    createReview: builder.mutation<
      Review,
      { agentId: string; slug: string; body: ReviewCreateInput }
    >({
      query: ({ agentId, body }) => ({
        url: `/agents/${agentId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { slug }) => [
        { type: 'Review', id: slug },
      ],
    }),
  }),
})

export const {
  useListCategoriesQuery,
  useListAgentsQuery,
  useGetAgentQuery,
  useGetAlternativesQuery,
  useToggleUpvoteMutation,
  useSubmitAgentMutation,
  useListCollectionsQuery,
  useGetCollectionQuery,
  useCompareAgentsQuery,
  useListReviewsQuery,
  useCreateReviewMutation,
} = agentsApi
