import { Migration } from '@mikro-orm/migrations';

export class Migration20260619033924 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `alter table "transaction_items" alter column "item_type" type text using ("item_type"::text);`,
    );
    this.addSql(
      `alter table "transaction_items" rename column "qty" to "quantity";`,
    );
    this.addSql(
      `alter table "transaction_items" add constraint "transaction_items_item_type_check" check ("item_type" in ('treatment', 'product'));`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "transaction_items" drop constraint "transaction_items_item_type_check";`,
    );
    this.addSql(
      `alter table "transaction_items" alter column "item_type" type varchar(255) using ("item_type"::varchar(255));`,
    );
    this.addSql(
      `alter table "transaction_items" rename column "quantity" to "qty";`,
    );
  }
}
