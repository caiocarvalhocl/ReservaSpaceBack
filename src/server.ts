import { app } from './app';
import { sequelize } from './models';
import { config } from './config';
import { connectMongoDB } from './config/mongo';

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL database connection has been established successfully.');

    await sequelize.sync({ force: true });
    console.log('PostgreSQL database synchronized.');

    await connectMongoDB();

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start the server:', error);
    process.exit(1);
  }
};

startServer();
