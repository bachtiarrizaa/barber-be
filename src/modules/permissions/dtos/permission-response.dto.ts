export interface PermissionChildDto {
  id: string | undefined;
  name: string;
  actionCode: string | null;
  description: string | null;
}

export interface PermissionResponseDto {
  id: string | undefined;
  name: string;
  description: string | null;
  children: PermissionChildDto[];
}
