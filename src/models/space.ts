import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user';

interface SpaceAttributes {
  id: number;
  name: string;
  type: string;
  capacity: number;
  imageUrl?: string;
  price?: number;
  description?: string;
  manager_id?: number;
  isAvailable: boolean;
}

interface SpaceCreationAttributes
  extends Optional<
    SpaceAttributes,
    'id' | 'description' | 'manager_id' | 'isAvailable'
  > {}

class Space
  extends Model<SpaceAttributes, SpaceCreationAttributes>
  implements SpaceAttributes
{
  public id!: number;
  public name!: string;
  public type!: string;
  public capacity!: number;
  public imageUrl!: string;
  public price!: number;
  public description?: string;
  public manager_id?: number;
  public isAvailable!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Space.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'spaces',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

export { Space };
