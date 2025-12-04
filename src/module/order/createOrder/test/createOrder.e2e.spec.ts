import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import { Order } from '../../Order';
import { buildApp } from '../../../../config/app';
import request from 'supertest';
import { Express } from 'express';

describe('US-2 : Créer une commande - E2E', () => {
    let container: StartedPostgreSqlContainer;
    let dataSource: DataSource;
    let app: Express;

    beforeAll(async () => {
        container = await new PostgreSqlContainer('postgres:16').withExposedPorts(5432).start();

        dataSource = new DataSource({
            type: 'postgres',
            host: container.getHost(),
            port: container.getPort(),
            username: container.getUsername(),
            password: container.getPassword(),
            database: container.getDatabase(),
            logging: false,
            entities: [Order],
            synchronize: true,
            entitySkipConstructor: true
        });

        await dataSource.initialize();

        const AppDataSource = require('../../../../config/db.config').default;
        Object.assign(AppDataSource, dataSource);

        app = buildApp();
    });

    afterAll(async () => {
        if (dataSource?.isInitialized) {
            await dataSource.destroy();
        }
        if (container) {
            await container.stop();
        }
    });


    test('Scénario 1: création réussie', async () => {
        await dataSource.getRepository(Order).clear();

        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [1, 2],
                totalPrice: 100
            })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(201);

        const orders = await dataSource.getRepository(Order).find();
        expect(orders).toHaveLength(1);
        expect(orders[0].productIds).toEqual([1, 2]);
        expect(orders[0].totalPrice).toBe(100);
        expect(orders[0].status).toBe('PENDING');
    });

    test('Scénario 2: création échouée - pas de produits', async () => {
        await dataSource.getRepository(Order).clear();

        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [],
                totalPrice: 100
            })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('une commande doit contenir au moins un produit');

        const orders = await dataSource.getRepository(Order).find();
        expect(orders).toHaveLength(0);
    });


    test('Scénario 3: création échouée - trop de produits', async () => {
        await dataSource.getRepository(Order).clear();

        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [1, 2, 3, 4, 5, 6],
                totalPrice: 100
            })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('une commande ne peut pas contenir plus de 5 produits');

        const orders = await dataSource.getRepository(Order).find();
        expect(orders).toHaveLength(0);
    });


    test('Scénario 4: création échouée - prix trop bas', async () => {
        await dataSource.getRepository(Order).clear();

        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [1],
                totalPrice: 1
            })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('le prix total doit être supérieur ou égal à 2 euros');

        const orders = await dataSource.getRepository(Order).find();
        expect(orders).toHaveLength(0);
    });

    test('Scénario 5: création échouée - prix trop haut', async () => {
        await dataSource.getRepository(Order).clear();

        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [1, 2],
                totalPrice: 600
            })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('le prix total doit être inférieur ou égal à 500 euros');

        const orders = await dataSource.getRepository(Order).find();
        expect(orders).toHaveLength(0);
    });
});
