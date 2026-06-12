import { Migration } from '@mikro-orm/migrations';

export class Migration20260612062922 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `create table "customers" ("id" uuid not null, "name" varchar(255) not null, "phone" varchar(255) not null, "address" text null, "total_points" int not null default 0, "last_transaction_at" timestamptz null, "points_expiry_started_at" timestamptz null, "points_expired_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`,
    );
    this.addSql(
      `alter table "customers" add constraint "customers_phone_unique" unique ("phone");`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "customers" cascade;`);
  }
}
