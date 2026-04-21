export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: {
    username?: string[];
    officeId?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
} | null;
