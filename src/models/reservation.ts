import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ReservationAttributes {
  id: number;
  space_id: number;
  user_id: number;
  start_time: Date;
  end_time: Date;
  status: 'pendente' | 'confirmada' | 'cancelada' | 'concluida'; // Example statuses
  created_at?: Date;
}

interface ReservationCreationAttributes
  extends Optional<ReservationAttributes, 'id' | 'status' | 'created_at'> {}

class Reservation
  extends Model<ReservationAttributes, ReservationCreationAttributes>
  implements ReservationAttributes
{
  public id!: number;
  public space_id!: number;
  public user_id!: number;
  public start_time!: Date;
  public end_time!: Date;
  public status!: 'pendente' | 'confirmada' | 'cancelada' | 'concluida';

  // DDL specifies `created_at` default, so using Sequelize's `createdAt` timestamp
  // We'll rename it in the model definition to match DDL for clarity.
  public readonly createdAt!: Date;

  // Define a custom getter/setter for created_at if you strictly need it,
  // but Sequelize's default `createdAt` maps directly to your DDL.
  // We'll map it directly in the init method.
}

Reservation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    space_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'spaces',
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'pendente',
    },
    created_at: {
      // Explicitly define to match DDL name if needed
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at', // Maps this attribute to the DDL column name
    },
  },
  {
    sequelize,
    tableName: 'reservations', // Match your DDL table name
    timestamps: true, // This enables createdAt and updatedAt
    updatedAt: false, // You don't have updatedAt in DDL, so disable it
    createdAt: 'created_at', // Map Sequelize's `createdAt` to `created_at` column in DDL
    // Add a check constraint for end_time > start_time.
    // Sequelize supports constraints directly, but for DDL level checks,
    // it's often better handled at the database level.
    // However, you can add model validations for application-level checks.
    validate: {
      endTimeAfterStartTime() {
        if (
          this.start_time &&
          this.end_time &&
          this.end_time <= this.start_time
        ) {
          throw new Error('End time must be after start time.');
        }
      },
    },
  },
);

export { Reservation };
