import { User } from './entities/User';
import { Session } from '../../modules/gateway/entities/session.entity';
import { Conversation } from './entities/Conversation';
import { Message } from './entities/Message';
import { Group } from '../../modules/groups/entities/Group';
import { GroupMessage } from '../../modules/groups/entities/GroupMessage';
import { Profile } from './entities/Profile';
import { MessageAttachment } from './entities/MessageAttachment';
import { GroupMessageAttachment } from '../../modules/groups/entities/GroupMessageAttachment';
import { UserPresence } from './entities/UserPresence';
import { Peer } from './entities/Peer';

const entities = [
  User,
  Session,
  Conversation,
  Message,
  Group,
  GroupMessage,
  Profile,
  MessageAttachment,
  GroupMessageAttachment,
  UserPresence,
  Peer,
];

export default entities;

export {
  User,
  Session,
  Conversation,
  Message,
  Group,
  GroupMessage,
  Profile,
  MessageAttachment,
  GroupMessageAttachment,
  UserPresence,
  Peer,
};
