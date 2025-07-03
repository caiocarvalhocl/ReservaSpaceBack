import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ResourceAttributes {
  id: number;
  name: string;
  description?: string;
  availableQuantity: number;
}

interface ResourceCreationAttributes extends Optional<ResourceAttributes, 'id' | 'description'> {}

export class Resource extends Model<ResourceAttributes, ResourceCreationAttributes> implements ResourceAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public availableQuantity!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Resource.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    availableQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'resources',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
);
