import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface SpaceAttributes {
  id: number;
  name: string;
  type: string;
  capacity: number;
  imageUrl?: string;
  price?: number;
  description?: string;
  managerId?: number;
  isAvailable: boolean;
  status: 'active' | 'maintenance' | 'inactive';
}

interface SpaceCreationAttributes
  extends Optional<
    SpaceAttributes,
    'id' | 'description' | 'managerId' | 'isAvailable' | 'status'
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
  public managerId?: number;
  public isAvailable!: boolean;
  public status!: 'active' | 'maintenance' | 'inactive';

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
    managerId: {
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
    status: {
      type: DataTypes.TEXT,
      defaultValue: 'active',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'spaces',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
);

export { Space };
