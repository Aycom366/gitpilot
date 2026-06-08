import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GenerateModule } from './generate/generate.module';
import { config } from './config';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.databaseUrl,
      entities: [__dirname + '/database/models/*.entity.{ts,js}'],
      migrations: [__dirname + '/migrations/*.{ts,js}'],
      synchronize: false,
    }),
    RedisModule,
    QueueModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    GenerateModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
