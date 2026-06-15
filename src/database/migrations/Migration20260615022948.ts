import { Migration } from '@mikro-orm/migrations';

export class Migration20260615022948 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `create table "point_logs" ("id" uuid not null, "customer_id" uuid not null, "transaction_id" uuid null, "point_changes" int not null, "type" text not null, "note" text null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`,
    );

    this.addSql(
      `create table "voucher_redemptions" ("id" uuid not null, "customer_id" uuid not null, "voucher_id" uuid not null, "transaction_id" uuid null, "is_used" boolean not null default false, "used_at" timestamptz null, "expired_at" timestamptz not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`,
    );

    this.addSql(
      `alter table "point_logs" add constraint "point_logs_customer_id_foreign" foreign key ("customer_id") references "customers" ("id");`,
    );
    this.addSql(
      `alter table "point_logs" add constraint "point_logs_type_check" check ("type" in ('earn', 'redeem', 'expired', 'adjust'));`,
    );

    this.addSql(
      `alter table "voucher_redemptions" add constraint "voucher_redemptions_customer_id_foreign" foreign key ("customer_id") references "customers" ("id");`,
    );
    this.addSql(
      `alter table "voucher_redemptions" add constraint "voucher_redemptions_voucher_id_foreign" foreign key ("voucher_id") references "vouchers" ("id");`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "point_logs" cascade;`);
    this.addSql(`drop table if exists "voucher_redemptions" cascade;`);
  }
}
