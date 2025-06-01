import { sequelize } from '../config/database';
import { User } from './user';
import { Space } from './space';
import { Resource } from './resource';
import { SpaceResource } from './spaceResource';
import { Reservation } from './reservation';
import { ReservationHistory } from './reservationHistory';

// Define Associations

// User and Space (manager_id)
User.hasMany(Space, { foreignKey: 'manager_id', as: 'managedSpaces' });
Space.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });

// Space and Resource (Many-to-Many through SpaceResource)
Space.belongsToMany(Resource, {
  through: SpaceResource,
  foreignKey: 'space_id',
  as: 'resources',
});
Resource.belongsToMany(Space, {
  through: SpaceResource,
  foreignKey: 'resource_id',
  as: 'spaces',
});

// SpaceResource associations
SpaceResource.belongsTo(Space, { foreignKey: 'space_id' });
// Add the 'as' alias here to match the include statement in your controller
SpaceResource.belongsTo(Resource, {
  foreignKey: 'resource_id',
  as: 'resource',
}); // <--- ADDED 'as: 'resource''
Space.hasMany(SpaceResource, { foreignKey: 'space_id', as: 'spaceResources' });
Resource.hasMany(SpaceResource, {
  foreignKey: 'resource_id',
  as: 'resourceSpaces',
});

// User and Reservation
User.hasMany(Reservation, { foreignKey: 'user_id', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Space and Reservation
Space.hasMany(Reservation, { foreignKey: 'space_id', as: 'reservations' });
Reservation.belongsTo(Space, { foreignKey: 'space_id', as: 'space' });

// Reservation and ReservationHistory
Reservation.hasMany(ReservationHistory, {
  foreignKey: 'reservation_id',
  as: 'history',
});
ReservationHistory.belongsTo(Reservation, {
  foreignKey: 'reservation_id',
  as: 'reservation',
});

// User and ReservationHistory (action_user)
User.hasMany(ReservationHistory, {
  foreignKey: 'action_user',
  as: 'actionHistory',
});
ReservationHistory.belongsTo(User, {
  foreignKey: 'action_user',
  as: 'actionByUser',
});

// Export sequelize instance and models
export {
  sequelize,
  User,
  Space,
  Resource,
  SpaceResource,
  Reservation,
  ReservationHistory,
};
