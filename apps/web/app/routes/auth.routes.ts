import { route } from '@react-router/dev/routes';

export const authRoutes = [
  route('login', 'pages/LoginPage.tsx'),
  route('signup', 'pages/SignupPage.tsx'),
  route('forgot-password', 'pages/ForgotPasswordPage.tsx'),
  route('reset-password', 'pages/ResetPasswordPage.tsx'),
];
