'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import axios from 'axios';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Fade,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { Visibility, VisibilityOff } from '@mui/icons-material';

import { authService } from '@/services/auth.service';
import type { RegisterPayload } from '@/types/auth.type';
import { useAuth } from '@/context/AuthContext';
import { setAuthTokens } from '@/lib/api-client';

import { registerSchema } from './register.schema';
import { componentStyles } from '@/app/styles/components';

type RegisterFormValues = z.infer<typeof registerSchema>;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function buildRegisterPayload(values: RegisterFormValues): RegisterPayload {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    password: values.password,
    phone: values.phone?.trim() || null,
  };
}

function getRegistrationErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  return 'Unable to create your account. Please try again.';
}

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

interface PasswordFieldProps {
  register: ReturnType<typeof useForm<RegisterFormValues>>['register'];
  error?: string;
}

function PasswordField({ register, error }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      {...register('password')}
      label="Password"
      type={showPassword ? 'text' : 'password'}
      placeholder="Enter your password"
      fullWidth
      required
      error={!!error}
      helperText={error ?? 'At least 8 characters, including uppercase, lowercase, and a number.'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                sx={componentStyles.actionButton}
                onClick={() => setShowPassword((previous) => !previous)}
                edge="end"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

interface RegistrationFieldsProps {
  register: ReturnType<typeof useForm<RegisterFormValues>>['register'];
  errors: ReturnType<typeof useForm<RegisterFormValues>>['formState']['errors'];
}

function RegistrationFields({ register, errors }: RegistrationFieldsProps) {
  return (
    <Stack spacing={2.5}>
      {/* First and Last Name */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          {...register('firstName')}
          label="First name"
          placeholder="John"
          fullWidth
          required
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
        />

        <TextField
          {...register('lastName')}
          label="Last name"
          placeholder="Doe"
          fullWidth
          required
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
        />
      </Stack>

      {/* Email */}
      <TextField
        {...register('email')}
        label="Email address"
        type="email"
        placeholder="john@example.com"
        fullWidth
        required
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      {/* Phone */}
      <TextField
        {...register('phone')}
        label="Phone number"
        type="tel"
        placeholder="+961 70 123 456"
        fullWidth
        error={!!errors.phone}
        helperText={errors.phone?.message}
      />

      {/* Password */}
      <PasswordField register={register} error={errors.password?.message} />
    </Stack>
  );
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function RegisterPage() {
  const navigate = useNavigate();
  const { retrySessionCheck } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),

    onSuccess: (tokens) => {
      setAuthTokens(tokens);
      retrySessionCheck();
      navigate('/', { replace: true });
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(buildRegisterPayload(values));
  };

  return (
    <Fade in timeout={700}>
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,
          mx: 'auto',
          px: 2,
          py: 5,
        }}
      >
        <Card
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 3,
            bgcolor: 'background.paper',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3}>
              {/* Header */}
              <Box>
                <Typography variant="h4" gutterBottom>
                  Create an account
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Enter your details to create your Apulse account.
                </Typography>
              </Box>

              {/* API Error */}
              {registerMutation.isError && (
                <Alert severity="error">
                  {getRegistrationErrorMessage(registerMutation.error)}
                </Alert>
              )}

              {/* Registration Form */}
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={2.5}>
                  <RegistrationFields register={register} errors={errors} />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={registerMutation.isPending}
                    sx={{
                      py: 1.4,
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    {registerMutation.isPending ? 'Creating account...' : 'Create account'}
                  </Button>
                </Stack>
              </Box>

              {/* Login Link */}
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => navigate('/login')}
                  sx={{ fontWeight: 600 }}
                >
                  Sign in
                </Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
}
