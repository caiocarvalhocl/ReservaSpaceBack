import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ReservationHistoryAttributes {
  id: number;
  reservation_id: number;
  action: string;
  action_date?: Date;
  action_user?: number;
  details?: string;
}

interface ReservationHistoryCreationAttributes
  extends Optional<
    ReservationHistoryAttributes,
    'id' | 'action_date' | 'details' | 'action_user'
  > {}

class ReservationHistory
  extends Model<
    ReservationHistoryAttributes,
    ReservationHistoryCreationAttributes
  >
  implements ReservationHistoryAttributes
{
  public id!: number;
  public reservation_id!: number;
  public action!: string;
  public action_date!: Date; // The DDL has a default, so it's always there
  public action_user?: number;
  public details?: string;

  // Timestamps (Sequelize adds createdAt and updatedAt by default)
  public readonly createdAt!: Date;
}

ReservationHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reservation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'reservations',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    action_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'action_date', // Maps this attribute to the DDL column name
    },
    action_user: {
      type: DataTypes.INTEGER,
      allowNull: true, // Can be NULL as per DDL
      references: {
        model: 'users',
        key: 'id',
      },
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'reservation_history', // Match your DDL table name
    timestamps: true,
    updatedAt: false, // You don't have updatedAt in DDL, so disable it
    createdAt: 'action_date', // Map Sequelize's `createdAt` to `action_date` column in DDL
  },
);

export { ReservationHistory };
