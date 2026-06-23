import { Migration } from '@mikro-orm/migrations';

export class Migration20260623043840 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "transactions" add "amount_paid" decimal(10,2) not null default '0', add "change_amount" decimal(10,2) not null default '0';`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "transactions" drop column "amount_paid", drop column "change_amount";`);
  }

}
