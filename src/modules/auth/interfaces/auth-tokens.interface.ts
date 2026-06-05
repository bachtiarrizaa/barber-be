export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
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

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  permissions: ParentPermission[];
}
