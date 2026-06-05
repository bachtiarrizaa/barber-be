import 'dotenv/config';
import { LoadStrategy, defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';
import { appConfig } from './app.config';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';

export const mikroOrmConfig = defineConfig({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.DB_NAME || 'barbers_db',
  loadStrategy: LoadStrategy.BALANCED,
  populateWhere: 'infer',
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  metadataProvider: ReflectMetadataProvider,
  debug: appConfig.debug,
  allowGlobalContext: process.env.NODE_ENV !== 'production',
  migrations: {
    path: 'dist/database/migrations',
    pathTs: 'src/database/migrations',
    snapshot: true,
  },
  seeder: {
    path: 'dist/database/seeders',
    pathTs: 'src/database/seeders',
  },
  extensions: [Migrator, SeedManager],
});

export default mikroOrmConfig;
