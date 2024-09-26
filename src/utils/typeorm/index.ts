import { User } from './entities/User';
import { Profile } from './entities/Profile';
import { GroupMessageAttachment } from '../../modules/groups/entities/GroupMessageAttachment';
import { UserPresence } from './entities/UserPresence';
import { Peer } from './entities/Peer';

const entities = [User, Profile, GroupMessageAttachment, UserPresence, Peer];

export default entities;

export { User, Profile, GroupMessageAttachment, UserPresence, Peer };
