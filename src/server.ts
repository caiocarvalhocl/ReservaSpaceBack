import { app } from './app';
import { sequelize } from './models';
import { config } from './config';

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await sequelize.sync({ force: true }); // `alter: true` attempts to change current tables to match models
    console.log('Database synchronized.');

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error(
      'Unable to connect to the database or start the server:',
      error,
    );
    process.exit(1); // Exit with a non-zero code to indicate an error
  }
};

startServer();
