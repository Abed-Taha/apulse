export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
