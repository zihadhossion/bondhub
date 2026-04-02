import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/api/category.service';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: Infinity,
  });
}
