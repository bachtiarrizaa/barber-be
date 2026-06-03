import { Migration } from '@mikro-orm/migrations';

export class Migration20260603042743 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `create table "treatments" ("id" uuid not null, "name" varchar(255) not null, "description" text null, "image" varchar(255) null, "price" decimal(10, 2) not null, "is_active" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "treatments" cascade;`);
  }
}
