import { Migration } from '@mikro-orm/migrations';

export class Migration20260609074838 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "products" add constraint "products_name_unique" unique ("name");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "products" drop constraint "products_name_unique";`);
  }

}
