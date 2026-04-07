import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/api/user.service';
import { setCredentials } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../hooks/useAppSelector';

// Minimal user service for admin dashboard bootstrap
// We need to check if there's a valid admin session on page load

interface AdminAuthBootstrapProps {
  children: React.ReactNode;
}

export default function AdminAuthBootstrap({ children }: AdminAuthBootstrapProps) {
  const dispatch = useAppDispatch();

  const { isLoading } = useQuery({
    queryKey: ['auth', 'bootstrap'],
    queryFn: async () => {
      try {
        const user = await userService.getMe();
        dispatch(setCredentials(user));
        return user;
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
