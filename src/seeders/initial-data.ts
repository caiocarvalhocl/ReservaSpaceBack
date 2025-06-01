import { QueryInterface, DataTypes, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../models'; // Import your configured sequelize instance

const SEED_PASSWORD = 'password123'; // Base password for all seed users

// Re-defining this interface for clarity, though it's already used below.
interface BulkInsertResult {
  id: number;
}

const seeder = {
  up: async (queryInterface: QueryInterface) => {
    // Hash the password once
    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

    // 1. Seed Users
    const users = (await queryInterface.bulkInsert(
      'users',
      [
        {
          name: 'Admin User',
          email: 'admin@example.com',
          password: hashedPassword,
          phone: '11987654321',
          role: 'admin',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Manager User',
          email: 'manager@example.com',
          password: hashedPassword,
          phone: '21987654321',
          role: 'manager',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Regular User One',
          email: 'user1@example.com',
          password: hashedPassword,
          phone: '31987654321',
          role: 'regular',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Regular User Two',
          email: 'user2@example.com',
          password: hashedPassword,
          phone: '41987654321',
          role: 'regular',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { returning: ['id'] } as any,
    )) as BulkInsertResult[]; // Cast options to any

    const adminUserId = users[0].id;
    const managerUserId = users[1].id;
    const user1Id = users[2].id;
    const user2Id = users[3].id;

    // 2. Seed Spaces
    const spaces = (await queryInterface.bulkInsert(
      'spaces',
      [
        {
          name: 'Sala de Reunião Alpha',
          type: 'meeting_room',
          capacity: 10,
          description: 'Sala com projetor e tela para reuniões',
          manager_id: managerUserId,
          isAvailable: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Quadra Poliesportiva',
          type: 'sports_court',
          capacity: 30,
          description: 'Quadra para futebol, basquete e vôlei',
          manager_id: adminUserId, // Admin manages this one
          isAvailable: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Auditório Principal',
          type: 'auditorium',
          capacity: 100,
          description: 'Auditório para grandes eventos e palestras',
          manager_id: managerUserId,
          isAvailable: false, // Not available for now
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Coworking Space B',
          type: 'coworking',
          capacity: 20,
          description: 'Espaço de trabalho compartilhado com mesas e internet',
          manager_id: adminUserId,
          isAvailable: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { returning: ['id'] } as any,
    )) as BulkInsertResult[]; // Cast options to any

    const salaAlphaId = spaces[0].id;
    const quadraId = spaces[1].id;
    const auditorioId = spaces[2].id;
    const coworkingBId = spaces[3].id;

    // 3. Seed Resources
    const resources = (await queryInterface.bulkInsert(
      'resources',
      [
        {
          name: 'Projetor HD',
          description: 'Projetor de alta definição',
          available_quantity: 5,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Quadro Branco',
          description: 'Quadro branco com canetas e apagador',
          available_quantity: 10,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Sistema de Som',
          description: 'Sistema de som profissional com microfones',
          available_quantity: 2,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Cadeiras Extras',
          description: 'Cadeiras adicionais para eventos',
          available_quantity: 50,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { returning: ['id'] } as any,
    )) as BulkInsertResult[]; // Cast options to any

    const projetorId = resources[0].id;
    const quadroBrancoId = resources[1].id;
    const sistemaSomId = resources[2].id;
    const cadeirasExtrasId = resources[3].id;

    // 4. Seed Space Resources (linking spaces to resources)
    await queryInterface.bulkInsert('space_resources', [
      {
        space_id: salaAlphaId,
        resource_id: projetorId,
        quantity: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        space_id: salaAlphaId,
        resource_id: quadroBrancoId,
        quantity: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        space_id: quadraId,
        resource_id: sistemaSomId,
        quantity: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        space_id: auditorioId,
        resource_id: sistemaSomId,
        quantity: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        space_id: auditorioId,
        resource_id: cadeirasExtrasId,
        quantity: 30, // Auditorium comes with 30 extra chairs
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        space_id: coworkingBId,
        resource_id: quadroBrancoId,
        quantity: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 5. Seed Reservations (Ensure future dates relative to current time)
    const now = new Date();
    // Using current time: Sunday, June 1, 2025 at 4:13:15 PM -03.
    // Ensure these dates are well into the future from when you run the seed.
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    const reservation1StartTime = new Date(
      now.getTime() + 2 * oneDay + 1 * 60 * 60 * 1000,
    ); // 2 days and 1 hour from now
    const reservation1EndTime = new Date(
      reservation1StartTime.getTime() + 1 * 60 * 60 * 1000,
    ); // 1 hour duration

    const reservation2StartTime = new Date(
      now.getTime() + 3 * oneDay + 10 * 60 * 60 * 1000,
    ); // 3 days and 10 hours from now
    const reservation2EndTime = new Date(
      reservation2StartTime.getTime() + 2 * 60 * 60 * 1000,
    ); // 2 hour duration

    const reservation3StartTime = new Date(
      now.getTime() + 4 * oneDay + 14 * 60 * 60 * 1000,
    ); // 4 days and 14 hours from now
    const reservation3EndTime = new Date(
      reservation3StartTime.getTime() + 3 * 60 * 60 * 1000,
    ); // 3 hour duration

    await queryInterface.bulkInsert('reservations', [
      {
        space_id: salaAlphaId,
        user_id: user1Id,
        start_time: reservation1StartTime,
        end_time: reservation1EndTime,
        status: 'confirmada',
        created_at: new Date(),
      },
      {
        space_id: quadraId,
        user_id: user2Id,
        start_time: reservation2StartTime,
        end_time: reservation2EndTime,
        status: 'pendente',
        created_at: new Date(),
      },
      {
        space_id: salaAlphaId,
        user_id: managerUserId,
        start_time: reservation3StartTime,
        end_time: reservation3EndTime,
        status: 'pendente',
        created_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    // Delete in reverse order to respect foreign key constraints
    // (Note: reservation_history is automatically handled by CASCADE if configured or needs explicit deletion)
    await queryInterface.bulkDelete('reservations', {}, {});
    await queryInterface.bulkDelete('space_resources', {}, {});
    await queryInterface.bulkDelete('resources', {}, {});
    await queryInterface.bulkDelete('spaces', {}, {});
    await queryInterface.bulkDelete('users', {}, {});
  },
};

// This allows direct execution of the file for seeding
if (require.main === module) {
  const runSeed = async () => {
    try {
      console.log('Connecting to database...');
      await sequelize.authenticate(); // Ensure connection is established
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
      // Ensure the database connection is closed after the seed operation
      // Use getDialect() instead of options.dialect
      if (sequelize.getDialect() === 'postgres') {
        await sequelize.close();
      }
    }
  };
  runSeed();
}
