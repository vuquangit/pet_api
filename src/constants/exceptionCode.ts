export const EXCEPTION_CODE = {
  AUTH: {
    ACCESS_TOKEN_EXPIRED: 'ACCESS_TOKEN_EXPIRED',
    REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  },
  OAUTH: {
    CODE_NOT_FOUND: 'OAUTH.CODE_NOT_FOUND',
    ERROR: 'OAUTH.ERROR',
  },
  USER: {
    EMAIL_NOT_FOUND: 'USER.EMAIL_NOT_FOUND',
    EMAIL_EXIST: 'USER.EMAIL_EXIST',
    WRONG_PASSWORD: 'USER.WRONG_PASSWORD',
    ID_NOT_FOUND: 'USER.ID_NOT_FOUND',
    ROLE_INVALID: 'USER.ROLE_INVALID',
    INVALID_RESET_TOKEN: 'USER.INVALID_RESET_TOKEN',
  },
  NOTIFICATION: {
    ID_NOT_FOUND: 'NOTIFICATION.ID_NOT_FOUND',
  },
  DINOSAUR: {
    ID_NOT_FOUND: 'DINOSAUR.ID_NOT_FOUND',
  },
  FRIEND_REQUEST: {
    EXCEPTION: 'FRIEND_REQUEST.EXCEPTION',
    NOT_FOUND: 'FRIEND_REQUEST.NOT_FOUND',
    ALREADY_ACCEPTED: 'FRIEND_REQUEST.ALREADY_ACCEPTED',
    PENDING: 'FRIEND_REQUEST.PENDING',
  },
  FRIEND: {
    CANNOT_DELETE: 'FRIEND.CANNOT_DELETE',
    NOT_FOUND: 'FRIEND.NOT_FOUND',
    ALREADY_EXISTS: 'FRIEND.ALREADY_EXISTS',
  },
};
