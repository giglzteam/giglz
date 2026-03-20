// jest.mock is hoisted — use jest.mocked() in beforeEach to configure per-test
jest.mock('@/lib/supabase/server')

import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/supabase/getUserPlan'

const mockGetUser = jest.fn()
const mockFrom = jest.fn()

beforeEach(() => {
  jest.mocked(createClient).mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  } as any)
  jest.clearAllMocks()
})

describe('getUserPlan', () => {

  it('returns "free" when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    expect(await getUserPlan()).toBe('free')
  })

  it('returns "plus" when profile.plan is "plus"', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { plan: 'plus' } }),
        }),
      }),
    })
    expect(await getUserPlan()).toBe('plus')
  })

  it('returns "pro" when profile.plan is "pro"', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { plan: 'pro' } }),
        }),
      }),
    })
    expect(await getUserPlan()).toBe('pro')
  })

  it('returns "free" when profile is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null }),
        }),
      }),
    })
    expect(await getUserPlan()).toBe('free')
  })

  it('returns "free" on Supabase error', async () => {
    mockGetUser.mockRejectedValue(new Error('network error'))
    expect(await getUserPlan()).toBe('free')
  })
})
