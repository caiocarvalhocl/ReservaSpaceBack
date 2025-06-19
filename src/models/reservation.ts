import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ReservationAttributes {
  id: number;
  spaceId: number;
  userId: number;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  createdAt?: Date;
}

interface ReservationCreationAttributes
  extends Optional<ReservationAttributes, 'id' | 'status' | 'createdAt'> {}

class Reservation
  extends Model<ReservationAttributes, ReservationCreationAttributes>
  implements ReservationAttributes
{
  public id!: number;
  public spaceId!: number;
  public userId!: number;
  public startTime!: Date;
  public endTime!: Date;
  public status!: 'pending' | 'confirmed' | 'canceled' | 'completed';
  public readonly createdAt!: Date;
}

Reservation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    spaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'spaces',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'pending',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'createdAt',
    },
  },
  {
    sequelize,
    tableName: 'reservations',
    timestamps: true,
    updatedAt: false,
    createdAt: 'createdAt',

    validate: {
      endTimeAfterStartTime() {
        if (this.startTime && this.endTime && this.endTime <= this.startTime) {
          throw new Error('End time must be after start time.');
        }
      },
    },
  },
);

export { Reservation };
