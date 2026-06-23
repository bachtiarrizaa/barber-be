import { Migration } from '@mikro-orm/migrations';

export class Migration20260623071719 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "stock_logs" add "note" text null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "stock_logs" drop column "note";`);
  }

}
