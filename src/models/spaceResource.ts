import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface SpaceResourceAttributes {
  spaceId: number;
  resourceId: number;
  quantity: number;
}

interface SpaceResourceCreationAttributes
  extends Optional<SpaceResourceAttributes, never> {}

class SpaceResource
  extends Model<SpaceResourceAttributes, SpaceResourceCreationAttributes>
  implements SpaceResourceAttributes
{
  public spaceId!: number;
  public resourceId!: number;
  public quantity!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SpaceResource.init(
  {
    spaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'spaces',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    resourceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'resources',
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
    tableName: 'space_resources',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
);

export { SpaceResource };
