import { http, HttpResponse } from 'msw'
import { testJob, testJobList } from './fixtures'

const BASE = 'http://localhost:3000/api/v1'

export const handlers = [
  // Jobs list
  http.get(`${BASE}/jobs`, () => {
    return HttpResponse.json(testJobList)
  }),

  // Job detail
  http.get(`${BASE}/jobs/:id`, ({ params }) => {
    const id = Number(params.id)
    if (id === 404) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json({
      job: { ...testJob, id },
      timeline_entries: [],
    })
  }),

  // Create job
  http.post(`${BASE}/jobs`, async ({ request }) => {
    const body = (await request.json()) as { job: Partial<typeof testJob> }
    return HttpResponse.json(
      { job: { ...testJob, id: 99, ...body.job } },
      { status: 201 },
    )
  }),

  // Update job
  http.patch(`${BASE}/jobs/:id`, async ({ params, request }) => {
    const id = Number(params.id)
    const body = (await request.json()) as { job: Partial<typeof testJob> }
    return HttpResponse.json({ job: { ...testJob, id, ...body.job } })
  }),

  // Delete job
  http.delete(`${BASE}/jobs/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Archive / unarchive
  http.patch(`${BASE}/jobs/:id/archive`, ({ params }) => {
    return HttpResponse.json({ job: { ...testJob, id: Number(params.id), archived_at: '2024-06-01T00:00:00Z' } })
  }),

  http.patch(`${BASE}/jobs/:id/unarchive`, ({ params }) => {
    return HttpResponse.json({ job: { ...testJob, id: Number(params.id), archived_at: undefined } })
  }),
]
