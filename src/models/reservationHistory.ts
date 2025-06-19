import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ReservationHistoryAttributes {
  id: number;
  reservationId: number;
  action: string;
  actionDate?: Date;
  actionUser?: number;
  details?: string;
}

interface ReservationHistoryCreationAttributes
  extends Optional<
    ReservationHistoryAttributes,
    'id' | 'actionDate' | 'details' | 'actionUser'
  > {}

export class ReservationHistory
  extends Model<
    ReservationHistoryAttributes,
    ReservationHistoryCreationAttributes
  >
  implements ReservationHistoryAttributes
{
  public id!: number;
  public reservationId!: number;
  public action!: string;
  public actionDate!: Date;
  public actionUser?: number;
  public details?: string;

  public readonly createdAt!: Date;
}

ReservationHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reservationId: {
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
    actionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'actionDate',
    },
    actionUser: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: 'reservation_history',
    timestamps: true,
    updatedAt: false,
    createdAt: 'actionDate',
  },
);
