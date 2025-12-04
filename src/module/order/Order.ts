import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column('simple-array')
    public productIds: number[];

    @Column({ type: 'float' })
    public totalPrice: number;

    @CreateDateColumn()
    public createdAt: Date;

    @Column({
        type: 'varchar',
        length: 50,
        default: OrderStatus.PENDING
    })
    public status: OrderStatus;

    constructor({ productIds, totalPrice }: { productIds: number[]; totalPrice: number }) {
        this.validateProductIds(productIds);
        this.validateTotalPrice(totalPrice);

        this.productIds = productIds;
        this.totalPrice = totalPrice;
        this.status = OrderStatus.PENDING;
    }

    private validateProductIds(productIds: number[]) {
        if (!Array.isArray(productIds) || productIds.length < 1) {
            throw new Error('une commande doit contenir au moins un produit');
        }

        if (productIds.length > 5) {
            throw new Error('une commande ne peut pas contenir plus de 5 produits');
        }
    }

    private validateTotalPrice(totalPrice: number) {
        if (totalPrice < 2) {
            throw new Error('le prix total doit être supérieur ou égal à 2 euros');
        }

        if (totalPrice > 500) {
            throw new Error('le prix total doit être inférieur ou égal à 500 euros');
        }
    }
}
