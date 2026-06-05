export type AuthModule = {
  name: "auth";
};

export type AuthStatus = {
  hasUser: boolean;
  authenticated: boolean;
};

export type AuthenticatedUser = {
  userId: string;
};
