/**
 * Tips API
 */

import { http } from '@/lib/http'
import { z } from 'zod'

// Tip schemas
export const sendTipInputSchema = z.object({
  recipientId: z.string(),
  amount: z.number().positive(),
  message: z.string().optional()
})

export const tipResponseSchema = z.object({
  id: z.string(),
  recipientId: z.string(),
  amount: z.number(),
  message: z.string().optional(),
  createdAt: z.string().transform((val) => new Date(val))
})

export type SendTipInput = z.infer<typeof sendTipInputSchema>
export type TipResponse = z.infer<typeof tipResponseSchema>

// Send tip
export async function sendTip(input: SendTipInput): Promise<TipResponse> {
  const response = await http.post<TipResponse>('/tips', input)
  return tipResponseSchema.parse(response)
}
