import { useMutation } from '@tanstack/react-query';
import { flagService } from '../services/api/flag.service';
import type { CreateFlagPayload } from '../types';

export function useCreateFlag() {
  return useMutation({
    mutationFn: (payload: CreateFlagPayload) => flagService.createFlag(payload),
  });
}
