import { Migration } from '@mikro-orm/migrations';

export class Migration20260605064023 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `alter table "roles" add constraint "roles_name_unique" unique ("name");`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "roles" drop constraint "roles_name_unique";`);
  }
}
