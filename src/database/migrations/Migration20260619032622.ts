import { Migration } from '@mikro-orm/migrations';

export class Migration20260619032622 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `alter table "point_logs" add constraint "point_logs_transaction_id_foreign" foreign key ("transaction_id") references "transactions" ("id") on delete set null;`,
    );

    this.addSql(
      `alter table "voucher_redemptions" drop column "transaction_id";`,
    );
    this.addSql(
      `alter table "voucher_redemptions" add "transaction_id_id" uuid null;`,
    );
    this.addSql(
      `alter table "voucher_redemptions" add constraint "voucher_redemptions_transaction_id_id_foreign" foreign key ("transaction_id_id") references "transactions" ("id") on delete set null;`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "point_logs" drop constraint "point_logs_transaction_id_foreign";`,
    );

    this.addSql(
      `alter table "voucher_redemptions" drop constraint "voucher_redemptions_transaction_id_id_foreign";`,
    );

    this.addSql(
      `alter table "voucher_redemptions" drop column "transaction_id_id";`,
    );
    this.addSql(
      `alter table "voucher_redemptions" add "transaction_id" uuid null;`,
    );
  }
}
