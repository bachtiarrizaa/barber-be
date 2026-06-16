import { Migration } from '@mikro-orm/migrations';

export class Migration20260615082912 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "settings" ("id" uuid not null, "key" varchar(255) not null, "value" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`);
    this.addSql(`alter table "settings" add constraint "settings_key_unique" unique ("key");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "settings" cascade;`);
  }

}
