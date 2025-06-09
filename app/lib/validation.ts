import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  email: z.string().email('بريد إلكتروني غير صالح'),
});

export const transactionSchema = z.object({
  customerId: z.string().min(1),
  content: z.string().min(1, 'المعاملة مطلوبة'),
});
