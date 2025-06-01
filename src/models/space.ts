import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user'; // Import User for association

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

  // Timestamps
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
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Can be NULL as per DDL (ON DELETE SET NULL)
      references: {
        model: 'users', // Refers to the table name 'users'
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
    timestamps: true, // Sequelize adds createdAt and updatedAt columns
    createdAt: 'created_at', // Map 'createdAt' model attribute to 'created_at' column
    updatedAt: 'updated_at',
  },
);

export { Space };
