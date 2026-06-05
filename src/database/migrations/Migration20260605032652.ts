import { Migration } from '@mikro-orm/migrations';

export class Migration20260605032652 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `create table "permissions" ("id" uuid not null, "name" varchar(255) not null, "action_code" varchar(255) null, "description" text null, "parent_id" uuid null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`,
    );
    this.addSql(
      `alter table "permissions" add constraint "permissions_action_code_unique" unique ("action_code");`,
    );

    this.addSql(
      `create table "role_permissions" ("role_id" uuid not null, "permission_id" uuid not null, primary key ("role_id", "permission_id"));`,
    );

    this.addSql(
      `alter table "permissions" add constraint "permissions_parent_id_foreign" foreign key ("parent_id") references "permissions" ("id") on delete set null;`,
    );

    this.addSql(
      `alter table "role_permissions" add constraint "role_permissions_role_id_foreign" foreign key ("role_id") references "roles" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "role_permissions" add constraint "role_permissions_permission_id_foreign" foreign key ("permission_id") references "permissions" ("id") on update cascade on delete cascade;`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "permissions" drop constraint "permissions_parent_id_foreign";`,
    );
    this.addSql(
      `alter table "role_permissions" drop constraint "role_permissions_permission_id_foreign";`,
    );

    this.addSql(`drop table if exists "permissions" cascade;`);
    this.addSql(`drop table if exists "role_permissions" cascade;`);
  }
}
