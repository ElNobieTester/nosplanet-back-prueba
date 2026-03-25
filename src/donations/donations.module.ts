import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { Donation, DonationSchema } from './schema/donation.schema';
import { User, UserSchema } from '../modules/users/schema/users.schema';
import { EcoParticipant, EcoParticipantSchema } from '../modules/users/schema/eco-participant.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Donation.name, schema: DonationSchema },
      { name: User.name, schema: UserSchema },
      { name: EcoParticipant.name, schema: EcoParticipantSchema },
    ]),
  ],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule { }
