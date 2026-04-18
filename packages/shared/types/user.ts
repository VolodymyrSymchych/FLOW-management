export interface User {
  id: number;
  email: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  provider?: string;
  providerId?: string;
  emailVerified: boolean;
  isActive: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  username: string;
  password?: string;
  fullName?: string;
  provider?: string;
  providerId?: string;
}

export interface UpdateUserInput {
  email?: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  isActive?: boolean;
  role?: string;
}

export interface UserProfile extends User {
  // Additional profile fields can be added here
}

