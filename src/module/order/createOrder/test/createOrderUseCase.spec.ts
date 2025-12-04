import { describe, expect, test } from '@jest/globals';
import { CreateOrderUseCase } from '../createOrderUseCase';
import { CreateOrderRepository } from '../createOrderRepository';
import { Order } from '../../Order';

class CreateOrderDummyRepository implements CreateOrderRepository {
    async save(Order: Order): Promise<void> {
        // Ne fait rien, c'est un dummy
    }
}

class CreateOrderMockFailRepository implements CreateOrderRepository {
    async save(Order: Order): Promise<void> {
        throw new Error('fail');
    }
}

describe('US-1 : Créer une commande', () => {
    test('Scénario 1 : création réussie', async () => {
        const CreateOrderRepository = new CreateOrderDummyRepository();
        const createOrderUseCase = new CreateOrderUseCase(CreateOrderRepository);

        await expect(
            createOrderUseCase.execute({
                productIds: [1, 2, 3],
                totalPrice: 300
            })
        ).resolves.not.toThrow();
    });

    test('Scénario 2 : commande sans produits', async () => {
        const CreateOrderRepository = new CreateOrderDummyRepository();
        const createOrderUseCase = new CreateOrderUseCase(CreateOrderRepository);

        await expect(
            createOrderUseCase.execute({
                productIds: [],
                totalPrice: 300
            })
        ).rejects.toThrow('une commande doit contenir au moins un produit');
    });

    test('Scénario 3 : commande avec trop de produits', async () => {
        const CreateOrderRepository = new CreateOrderDummyRepository();
        const createOrderUseCase = new CreateOrderUseCase(CreateOrderRepository);

        await expect(
            createOrderUseCase.execute({
                productIds: [1, 2, 3, 4, 5, 6],
                totalPrice: 300
            })
        ).rejects.toThrow('une commande ne peut pas contenir plus de 5 produits');
    });

    test('Scénario 4 : commande pas assez cher', async () => {
        const CreateOrderRepository = new CreateOrderDummyRepository();
        const createOrderUseCase = new CreateOrderUseCase(CreateOrderRepository);

        await expect(
            createOrderUseCase.execute({
                productIds: [1, 2],
                totalPrice: 1
            })
        ).rejects.toThrow('le prix total doit être supérieur ou égal à 2 euros');
    });

    test('Scénario 5 : commande trop cher', async () => {
        const CreateOrderRepository = new CreateOrderDummyRepository();
        const createOrderUseCase = new CreateOrderUseCase(CreateOrderRepository);

        await expect(
            createOrderUseCase.execute({
                productIds: [1, 2],
                totalPrice: 501
            })
        ).rejects.toThrow('le prix total doit être inférieur ou égal à 500 euros');
    });
});
