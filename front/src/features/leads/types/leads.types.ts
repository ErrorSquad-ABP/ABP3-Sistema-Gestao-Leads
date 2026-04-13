import type { z } from 'zod';

import type { leadListItemSchema } from '../schemas/lead-list.schema';

type LeadListItem = z.infer<typeof leadListItemSchema>;

export type { LeadListItem };
