import { Migration } from '@mikro-orm/migrations';

export class Migration20260604015442 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "roles" ("id" uuid not null, "name" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "roles" cascade;`);
  }

}
