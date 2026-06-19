import { Migration } from '@mikro-orm/migrations';

export class Migration20260619022102 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "transactions" ("id" uuid not null, "customer_id" uuid null, "cashier_id" uuid not null, "barber_id" uuid not null, "subtotal" decimal(10,2) not null, "discount_amount" decimal(10,2) not null default '0', "total" decimal(10,2) not null, "total_service_amount" decimal(10,2) not null, "total_product_amount" decimal(10,2) not null, "service_commission_rate" decimal(5,2) not null, "product_commission_rate" decimal(5,2) not null, "service_commission_amount" decimal(10,2) not null, "product_commission_amount" decimal(10,2) not null, "total_commission_amount" decimal(10,2) not null, "points_earned" int not null default 0, "points_used" int not null default 0, "payment_method" varchar(255) not null, "xendit_invoice_id" varchar(255) null, "payment_url" varchar(255) null, "paid_at" timestamptz null, "status" varchar(255) not null, "created_at" timestamptz not null, primary key ("id"));`);

    this.addSql(`create table "transaction_items" ("id" uuid not null, "transaction_id" uuid not null, "item_type" varchar(255) not null, "item_id" uuid null, "item_name" varchar(255) not null, "price" decimal(10,2) not null, "qty" int not null, "subtotal" decimal(10,2) not null, "created_at" timestamptz not null, primary key ("id"));`);

    this.addSql(`alter table "transactions" add constraint "transactions_customer_id_foreign" foreign key ("customer_id") references "customers" ("id") on delete set null;`);
    this.addSql(`alter table "transactions" add constraint "transactions_cashier_id_foreign" foreign key ("cashier_id") references "users" ("id");`);
    this.addSql(`alter table "transactions" add constraint "transactions_barber_id_foreign" foreign key ("barber_id") references "users" ("id");`);

    this.addSql(`alter table "transaction_items" add constraint "transaction_items_transaction_id_foreign" foreign key ("transaction_id") references "transactions" ("id");`);

    this.addSql(`alter table "settings" drop column "is_system";`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "transaction_items" drop constraint "transaction_items_transaction_id_foreign";`);

    this.addSql(`drop table if exists "transactions" cascade;`);
    this.addSql(`drop table if exists "transaction_items" cascade;`);

    this.addSql(`alter table "settings" add "is_system" boolean not null default false;`);
  }

}
