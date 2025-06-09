import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password?: string; // Optional for creating, required for fetching
  phone?: string;
  role: 'regular' | 'manager' | 'admin'; // Example roles
}

interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'role'> {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public phone?: string;
  public role!: 'regular' | 'manager' | 'admin';

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
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
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phone: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'regular',
    },
  },
  {
    sequelize,
    tableName: 'users', // Match your DDL table name
    timestamps: true, // Sequelize adds createdAt and updatedAt columns
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);
