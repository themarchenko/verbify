import { z } from 'zod/v4'

export const loginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(1),
  })
  .check((ctx) => {
    if (ctx.value.newPassword !== ctx.value.confirmPassword) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.confirmPassword,
        path: ['confirmPassword'],
        message: 'passwordMismatch',
      })
    }
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
