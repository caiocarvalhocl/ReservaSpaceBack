import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ResourceAttributes {
  id: number;
  name: string;
  description?: string;
  availableQuantity: number;
}

interface ResourceCreationAttributes
  extends Optional<ResourceAttributes, 'id' | 'description'> {}

class Resource
  extends Model<ResourceAttributes, ResourceCreationAttributes>
  implements ResourceAttributes
{
  public id!: number;
  public name!: string;
  public description?: string;
  public availableQuantity!: number;

  // Timestamps
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
    tableName: 'resources', // Match your DDL table name
    timestamps: true, // Sequelize adds createdAt and updatedAt columns
    createdAt: 'createdAt', // Map 'createdAt' model attribute to 'created_at' column
    updatedAt: 'updatedAt',
  },
);

export { Resource };
