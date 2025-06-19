import { QueryInterface, DataTypes, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../models';
import { getRandomValues } from 'crypto';

const SEED_PASSWORD = '123';
const FIXED_HASHED_PASSWORD =
  '$2a$12$uAliRqOX7YAeINVX.QpLIOL6mOzXcxJCbk9wHQM5hzYxxlQpEoyxK';

interface BulkInsertResult {
  id: number;
}

const seeder = {
  up: async (queryInterface: QueryInterface) => {
    const hashedPassword = FIXED_HASHED_PASSWORD;
    const NOW = new Date();

    const getRandomInt = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;
    const getRandomItem = (arr: any[]) => arr[getRandomInt(0, arr.length - 1)];
    const getRandomBool = () => Math.random() < 0.5;

    const spaceTypes = [
      'meeting_room',
      'sports_court',
      'auditorium',
      'coworking',
      'event_hall',
      'studio',
    ];
    const resourceNames = [
      'Projetor HD',
      'Quadro Branco',
      'Sistema de Som',
      'Cadeiras Extras',
      'Smart TV',
      'Máquina de Café',
      'Tela de Projeção',
      'Microfones Sem Fio',
      'Fliperama',
      'Mesa de Bilhar',
      'Iluminação Cênica',
      'Equipamento de Yoga',
    ];
    const userRoles = ['regular', 'manager'];
    let status = getRandomItem(['active', 'inactive', 'suspend']);

    const usersToInsert = [];
    usersToInsert.push({
      name: 'caio',
      email: 'caio@gmail.com',
      password: hashedPassword,
      phone: '11987654321',
      role: 'admin',
      status,
      createdAt: NOW,
      updatedAt: NOW,
    });
    usersToInsert.push({
      name: 'Manager One',
      email: 'manager1@example.com',
      password: hashedPassword,
      phone: '21987654321',
      role: 'manager',
      status,
      createdAt: NOW,
      updatedAt: NOW,
    });
    usersToInsert.push({
      name: 'Manager Two',
      email: 'manager2@example.com',
      password: hashedPassword,
      phone: '22987654321',
      role: 'manager',
      status,
      createdAt: NOW,
      updatedAt: NOW,
    });
    for (let i = 1; i <= 17; i++) {
      status = getRandomItem(['active', 'inactive', 'suspend']);
      usersToInsert.push({
        name: `Regular User ${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        phone: `3${i.toString().padStart(10, '0')}`,
        role: 'regular',
        status,
        createdAt: NOW,
        updatedAt: NOW,
      });
    }
    const users = (await queryInterface.bulkInsert('users', usersToInsert, {
      returning: ['id'],
    } as any)) as BulkInsertResult[];
    const managerUserIds = users.slice(1, 3).map(u => u.id);
    const allUserIds = users.map(u => u.id);

    const resourcesToInsert = [];
    for (let i = 0; i < resourceNames.length; i++) {
      resourcesToInsert.push({
        name: resourceNames[i],
        description: `Description for ${resourceNames[i]}`,
        availableQuantity: getRandomInt(1, 20),
        createdAt: NOW,
        updatedAt: NOW,
      });
    }
    const resources = (await queryInterface.bulkInsert(
      'resources',
      resourcesToInsert,
      { returning: ['id'] } as any,
    )) as BulkInsertResult[];
    const resourceIds = resources.map(r => r.id);

    const spacesToInsert = [];
    for (let i = 1; i <= 20; i++) {
      const type = getRandomItem(spaceTypes);
      const capacity =
        type === 'auditorium' ? getRandomInt(50, 200) : getRandomInt(5, 50);
      const isAvailable = getRandomBool();
      const managerId = getRandomItem(managerUserIds);
      const price = parseFloat((Math.random() * 500 + 50).toFixed(2));
      const imageUrl = null;
      const status = getRandomItem(['active', 'maintenance', 'inactive']);

      spacesToInsert.push({
        name: `Space ${i}`,
        type: type,
        capacity: capacity,
        description: `This is a beautiful ${type.replace('_', ' ')} for your needs.`,
        managerId: managerId,
        isAvailable: isAvailable,
        status: status,
        imageUrl: imageUrl,
        price: price,
        createdAt: NOW,
        updatedAt: NOW,
      });
    }

    const spaces = (await queryInterface.bulkInsert('spaces', spacesToInsert, {
      returning: ['id'],
    } as any)) as BulkInsertResult[];
    const spaceIds = spaces.map(s => s.id);

    const spaceResourcesToInsert = [];
    for (const spaceId of spaceIds) {
      const numResources = getRandomInt(1, 3);
      const assignedResourceIds: number[] = [];
      for (let i = 0; i < numResources; i++) {
        let resourceId = getRandomItem(resourceIds);
        while (assignedResourceIds.includes(resourceId)) {
          resourceId = getRandomItem(resourceIds);
        }
        assignedResourceIds.push(resourceId);
        spaceResourcesToInsert.push({
          spaceId: spaceId,
          resourceId: resourceId,
          quantity: getRandomInt(1, 5),
          createdAt: NOW,
          updatedAt: NOW,
        });
      }
    }
    await queryInterface.bulkInsert('space_resources', spaceResourcesToInsert);

    const reservationsToInsert = [];
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    for (let i = 1; i <= 20; i++) {
      const userId = getRandomItem(allUserIds);
      const spaceId = getRandomItem(spaceIds);

      const startTime = new Date(
        NOW.getTime() +
          getRandomInt(1, 30) * oneDay +
          getRandomInt(0, 23) * oneHour,
      );
      const endTime = new Date(
        startTime.getTime() + getRandomInt(1, 4) * oneHour,
      );
      const status = getRandomItem([
        'pending',
        'confirmed',
        'canceled',
        'completed',
      ]);

      reservationsToInsert.push({
        spaceId: spaceId,
        userId: userId,
        startTime: startTime,
        endTime: endTime,
        status: status,
        createdAt: NOW,
      });
    }
    const reservations = (await queryInterface.bulkInsert(
      'reservations',
      reservationsToInsert,
      { returning: ['id'] } as any,
    )) as BulkInsertResult[];

    const reservationHistoryToInsert = [];
    const actions = ['created', 'status_changed', 'cancelled', 'completed'];

    for (const reservation of reservations.slice(0, 10)) {
      const actionCount = getRandomInt(1, 3);
      for (let i = 0; i < actionCount; i++) {
        const actionUser = getRandomItem(allUserIds);
        const action = getRandomItem(actions);
        reservationHistoryToInsert.push({
          reservationId: reservation.id,
          action: action,
          actionDate: new Date(NOW.getTime() + getRandomInt(0, 5) * oneDay),
          actionUser: actionUser,
          details: `Action '${action}' performed on reservation ${reservation.id} by user ${actionUser}`,
        });
      }
    }
    await queryInterface.bulkInsert(
      'reservation_history',
      reservationHistoryToInsert,
    );
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('reservation_history', {}, {});
    await queryInterface.bulkDelete('reservations', {}, {});
    await queryInterface.bulkDelete('space_resources', {}, {});
    await queryInterface.bulkDelete('resources', {}, {});
    await queryInterface.bulkDelete('spaces', {}, {});
    await queryInterface.bulkDelete('users', {}, {});
  },
};

if (require.main === module) {
  const runSeed = async () => {
    try {
      console.log('Connecting to database...');
      await sequelize.authenticate();
      console.log('Database connected. Running seed...');

      const args = process.argv.slice(2);
      if (args.includes('--undo')) {
        await seeder.down(sequelize.getQueryInterface());
        console.log('Seed undone successfully.');
      } else {
        await seeder.up(sequelize.getQueryInterface());
        console.log('Seed completed successfully.');
      }
      process.exit(0);
    } catch (error) {
      console.error('Seeding failed:', error);
      process.exit(1);
    } finally {
      if (sequelize.getDialect() === 'postgres') {
        await sequelize.close();
      }
    }
  };
  runSeed();
}
