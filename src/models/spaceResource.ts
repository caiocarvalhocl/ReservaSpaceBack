import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface SpaceResourceAttributes {
  space_id: number;
  resource_id: number;
  quantity: number;
}

// Since this is a join table with a composite primary key, 'id' is not auto-generated
// and both space_id and resource_id are part of the primary key.
interface SpaceResourceCreationAttributes
  extends Optional<SpaceResourceAttributes, never> {}

class SpaceResource
  extends Model<SpaceResourceAttributes, SpaceResourceCreationAttributes>
  implements SpaceResourceAttributes
{
  public space_id!: number;
  public resource_id!: number;
  public quantity!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SpaceResource.init(
  {
    space_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Part of composite primary key
      references: {
        model: 'spaces', // Refers to the table name 'spaces'
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    resource_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Part of composite primary key
      references: {
        model: 'resources', // Refers to the table name 'resources'
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'space_resources', // Match your DDL table name
    timestamps: true, // Sequelize adds createdAt and updatedAt columns
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

export { SpaceResource };
