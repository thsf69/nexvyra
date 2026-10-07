import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  query: z.object({
    userId: z.never({ invalid_type_error: "Unauthorized parameter 'userId' is strictly forbidden." }).optional()
  })
});
