'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  Link,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { setAuthTokens } from '@/lib/api-client';
import { authService } from '@/services/auth.service';
import { queryClient } from '@/lib/query-client';
import type { LoginPayload } from '@/types/auth.type';
import { useAuth } from '@/context/AuthContext';
import { componentStyles } from '@/app/styles/components';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const tokens = await authService.login(payload);

      setAuthTokens(tokens);

      try {
        return await authService.getCurrentUser();
      } catch (error) {
        setAuthTokens(null);
        throw error;
      }
    },

    onSuccess: (user) => {
      queryClient.clear();
      signIn(user);

      navigate(destination, { replace: true });
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const errorMessage = axios.isAxiosError(loginMutation.error)
    ? (loginMutation.error.response?.data?.message ??
      'Unable to sign in. Please check your credentials.')
    : loginMutation.error instanceof Error
      ? loginMutation.error.message
      : 'Unable to sign in. Please try again.';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Sign in to your Apulse account to continue.
            </Typography>
          </Box>

          {loginMutation.isError && <Alert severity="error">{errorMessage}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2.5}>
              <TextField
                label="Email address"
                type="email"
                autoComplete="email"
                fullWidth
                autoFocus
                {...register('email')}
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                fullWidth
                {...register('password')}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword((previous) => !previous)}
                          edge="end"
                          sx={componentStyles.actionButton}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loginMutation.isPending}
                sx={{ py: 1.4, mt: 1 }}
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </Button>
            </Stack>
          </Box>
          {/* register Link */}
          <Typography variant="body2" color="text.secondary">
            {"Don't have account?"}
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => navigate('/register')}
              sx={{ fontWeight: 600 }}
            >
              Register
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
