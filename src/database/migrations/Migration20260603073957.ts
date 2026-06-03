import { Migration } from '@mikro-orm/migrations';

export class Migration20260603073957 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "vouchers" ("id" uuid not null, "name" varchar(255) not null, "description" text null, "points_required" int not null, "type" text not null, "value" decimal(10, 2) not null, "is_active" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`);

    this.addSql(`alter table "vouchers" add constraint "vouchers_type_check" check ("type" in ('percent', 'rupiah'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "vouchers" cascade;`);
  }

}
