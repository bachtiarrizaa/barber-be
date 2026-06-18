import { Migration } from '@mikro-orm/migrations';

export class Migration20260618034935 extends Migration {

  override up(): void | Promise<void> {
    // 1. Add columns. 'name' is temporary nullable to prevent violation on existing records.
    this.addSql(`alter table "settings" add "name" varchar(255) null, add "description" varchar(255) null, add "is_system" boolean not null default false;`);

    // 2. Populate 'name' for existing settings using initcap(replace(key, '_', ' '))
    // e.g. points_amount_per_unit -> Points Amount Per Unit
    this.addSql(`update "settings" set "name" = initcap(replace("key", '_', ' ')) where "name" is null;`);

    // 3. Set 'name' to not null now that existing rows have a name
    this.addSql(`alter table "settings" alter column "name" set not null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "settings" drop column "name", drop column "description", drop column "is_system";`);
  }

}
