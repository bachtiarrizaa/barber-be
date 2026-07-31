export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface ChildPermission {
  id: string;
  name: string;
  actionCode: string;
}

export interface ParentPermission {
  id: string;
  name: string;
  children: ChildPermission[];
}

export interface LoginResponse extends AuthTokens {
  user: {
    id: string;
    name: string;
    email: string;
    role: {
      id: string;
      name: string;
    };
  };
  permissions: ParentPermission[];
}
