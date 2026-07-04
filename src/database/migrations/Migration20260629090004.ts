import { Migration } from '@mikro-orm/migrations';

export class Migration20260629090004 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "attendances" ("id" uuid not null, "user_id" uuid not null, "date" date not null, "check_in" time not null, "check_out" time null, "evidence" varchar(255) not null, "note" text null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`);

    this.addSql(`alter table "attendances" add constraint "attendances_user_id_foreign" foreign key ("user_id") references "users" ("id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "attendances" cascade;`);
  }

}
