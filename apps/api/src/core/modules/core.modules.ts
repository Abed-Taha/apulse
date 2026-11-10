import { Module } from '@nestjs/common';
import { RoleModule } from '../../modules/role/role.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { UserModule } from '../../modules/user/user.module.js';
import { PermissionModule } from '../../modules/permission/permission.module.js';
import { CategoryModule } from '../../modules/category/category.module.js';
import { ProductModule } from '../../modules/product/product.module.js';
import { OfferModule } from '../../modules/offer/offer.module.js';
import { CartModule } from '../../modules/cart/cart.module.js';
import { OrderModule } from '../../modules/order/order.module.js';
import { InvoiceModule } from '../../modules/invoice/invoice.module.js';
import { TaskModule } from '../../modules/task/task.module.js';
import { NotificationModule } from '../../modules/notification/notification.module.js';
import { PaymentModule } from '../../modules/payment/payment.module.js';
import { VisitorModule } from '../../modules/visitor/visitor.module.js';
import { AnalyticsModule } from '../../modules/analytics/analytics.module.js';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    RoleModule,
    PermissionModule,
    CategoryModule,
    ProductModule,
    OfferModule,
    CartModule,
    OrderModule,
    InvoiceModule,
    TaskModule,
    NotificationModule,
    PaymentModule,
    VisitorModule,
    AnalyticsModule,
  ],
})
export class CoreModules {}
