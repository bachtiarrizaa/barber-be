import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './config/mikro-orm.config';
import { ProductModule } from './modules/products/products.module';
import { TreatmentModule } from './modules/treatments/treatments.module';
import { VoucherModule } from './modules/vouchers/vouchers.module';
import { RoleModule } from './modules/roles/role.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfileModule } from './modules/profiles/profiles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { CustomerModule } from './modules/customers/customers.module';
import { SettingModule } from './modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    RoleModule,
    AuthModule,
    UsersModule,
    CustomerModule,
    ProfileModule,
    ProductModule,
    TreatmentModule,
    VoucherModule,
    PermissionsModule,
    SettingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
