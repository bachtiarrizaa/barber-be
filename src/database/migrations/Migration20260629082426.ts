import { Migration } from '@mikro-orm/migrations';

export class Migration20260629082426 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "transactions" add constraint "transactions_xendit_invoice_id_unique" unique ("xendit_invoice_id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "transactions" drop constraint "transactions_xendit_invoice_id_unique";`);
  }

}
