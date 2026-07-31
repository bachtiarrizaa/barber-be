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
  permissions: ParentPermission[];
}
