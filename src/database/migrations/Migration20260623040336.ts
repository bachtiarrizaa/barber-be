import { Migration } from '@mikro-orm/migrations';

export class Migration20260623040336 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "stock_logs" ("id" uuid not null, "product_id" uuid not null, "qty_change" int not null, "type" varchar(255) not null, "reference_id" uuid null, "created_at" timestamptz not null, primary key ("id"));`);

    this.addSql(`alter table "stock_logs" add constraint "stock_logs_product_id_foreign" foreign key ("product_id") references "products" ("id");`);

    this.addSql(`alter table "transaction_items" drop constraint "transaction_items_item_type_check";`);
    this.addSql(`alter table "transaction_items" add constraint "transaction_items_item_type_check" check ("item_type" in ('treatment', 'product'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "stock_logs" cascade;`);

    this.addSql(`alter table "transaction_items" drop constraint "transaction_items_item_type_check";`);
    this.addSql(`alter table "transaction_items" add constraint "transaction_items_item_type_check" check ("item_type" in ('treatment', 'product'));`);
  }

}
