import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('payment_transactions')
export class PaymentTransaction extends AbstractBaseEntity {
    @Column()
    userId: string;

    @Column()
    provider: string; // 'google' | 'apple'

    @Column({ unique: true })
    transactionId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    amount: number;

    @Column({ nullable: true })
    currency: string;

    @Column()
    status: string; // 'COMPLETED', 'PENDING', 'FAILED'

    @Column()
    type: string; // 'PURCHASE', 'RENEWAL', 'REFUND'

    @Column({ type: 'text', nullable: true })
    rawResponse: string;
}
