import { sequelize } from '../config/database';
import { User } from './user';
import { Space } from './space';
import { Resource } from './resource';
import { SpaceResource } from './spaceResource';
import { Reservation } from './reservation';
import { ReservationHistory } from './reservationHistory';

User.hasMany(Space, { foreignKey: 'managerId', as: 'managedSpaces' });
Space.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

Space.belongsToMany(Resource, {
  through: SpaceResource,
  foreignKey: 'spaceId',
  as: 'resources',
});
Resource.belongsToMany(Space, {
  through: SpaceResource,
  foreignKey: 'resourceId',
  as: 'spaces',
});

SpaceResource.belongsTo(Space, { foreignKey: 'spaceId' });

SpaceResource.belongsTo(Resource, {
  foreignKey: 'resourceId',
  as: 'resource',
});
Space.hasMany(SpaceResource, { foreignKey: 'spaceId', as: 'spaceResources' });
Resource.hasMany(SpaceResource, {
  foreignKey: 'resourceId',
  as: 'resourceSpaces',
});

User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Space.hasMany(Reservation, { foreignKey: 'spaceId', as: 'reservations' });
Reservation.belongsTo(Space, { foreignKey: 'spaceId', as: 'space' });

Reservation.hasMany(ReservationHistory, {
  foreignKey: 'reservationId',
  as: 'history',
});
ReservationHistory.belongsTo(Reservation, {
  foreignKey: 'reservationId',
  as: 'reservation',
});

User.hasMany(ReservationHistory, {
  foreignKey: 'actionUser',
  as: 'actionHistory',
});
ReservationHistory.belongsTo(User, {
  foreignKey: 'actionUser',
  as: 'actionByUser',
});

export {
  sequelize,
  User,
  Space,
  Resource,
  SpaceResource,
  Reservation,
  ReservationHistory,
};
