import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/api/auth.service';
import { userService } from '../services/api/user.service';
import { setCredentials, clearCredentials } from '../store/slices/authSlice';
import { useAppDispatch } from './useAppSelector';
import type { RegisterPayload } from '../types';

export function useLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (user) => {
      dispatch(setCredentials({ user, role: user.role }));
      navigate('/feed');
    },
  });
}

export function useRegister() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (user) => {
      dispatch(setCredentials({ user, role: user.role }));
      navigate('/feed');
    },
  });
}

export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      dispatch(clearCredentials());
      queryClient.clear();
      navigate('/login');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
}

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword(token, newPassword),
    onSuccess: () => {
      navigate('/login');
    },
  });
}

export function useCurrentUser() {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['auth', 'bootstrap'],
    queryFn: async () => {
      try {
        const user = await userService.getMe();
        dispatch(setCredentials({ user, role: user.role }));
        return user;
      } catch {
        // No valid session — stay unauthenticated
        return null;
      }
    },
    staleTime: Infinity,
    retry: false,
  });
}
