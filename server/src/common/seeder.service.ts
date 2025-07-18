import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private paymentsService: PaymentsService,
  ) {}

  async onModuleInit() {
    await this.seedData();
  }

  private async seedData() {
    try {
      console.log('Seeding default users...');
      await this.usersService.seedDefaultUsers();
      
      console.log('Seeding sample payments...');
      await this.paymentsService.seedSampleData();
      
      console.log('Data seeding completed successfully!');
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }
}