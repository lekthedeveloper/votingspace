// Authentication Constants
export const AUTH = {
    ROLES: {
      USER: 'USER',
      ADMIN: 'ADMIN'
    },
    PASSWORD_RESET_TOKEN_EXPIRES_IN: 10 * 60 * 1000, // 10 minutes in milliseconds
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_ATTEMPTS_WINDOW: 60 * 60 * 1000, // 1 hour
    JWT_COOKIE_EXPIRES_IN: 90 // days
  };
  
  // Rate Limiting Constants
  export const RATE_LIMIT = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX: 1000, // limit each IP to 1000 requests per windowMs
    AUTH: {
      WINDOW_MS: 15 * 60 * 1000,
      MAX: 50 // stricter limit for auth endpoints
    },
    VOTE: {
      WINDOW_MS: 60 * 60 * 1000, // 1 hour
      MAX: 50 // limit voting attempts
    }
  };
  
  // Room Constants
  export const ROOM = {
    MIN_OPTIONS: 2,
    MAX_OPTIONS: 5,
    DEFAULT_VOTING_WINDOW_HOURS: 24, // default 24 hours for voting
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_OPTION_LENGTH: 50
  };
  
  // Voting Constants
  export const VOTE = {
    ANONYMOUS_ID_LENGTH: 16, // length of generated guest IDs
    MAX_JUSTIFICATION_LENGTH: 200 // if implementing vote justification bonus
  };
  
  // Error Messages
  export const ERROR_MESSAGES = {
    AUTH: {
      INVALID_CREDENTIALS: 'Invalid email or password',
      ACCOUNT_LOCKED: 'Account locked due to too many failed attempts. Try again later',
      UNAUTHORIZED: 'You are not authorized to access this resource',
      TOKEN_EXPIRED: 'Token has expired',
      TOKEN_INVALID: 'Token is invalid',
      NO_TOKEN: 'No token provided'
    },
    ROOM: {
      NOT_FOUND: 'Room not found',
      INVALID_OPTIONS: `Room must have between ${ROOM.MIN_OPTIONS} and ${ROOM.MAX_OPTIONS} options`,
      VOTING_CLOSED: 'Voting is closed for this room',
      NOT_CREATOR: 'Only room creator can perform this action'
    },
    VOTE: {
      ALREADY_VOTED: 'You have already voted in this room',
      INVALID_OPTION: 'Invalid voting option',
      ANONYMOUS_LIMIT: 'Anonymous voting limit reached'
    },
    VALIDATION: {
      INVALID_EMAIL: 'Please provide a valid email',
      PASSWORD_LENGTH: 'Password must be at least 8 characters',
      PASSWORD_MISMATCH: 'Passwords do not match'
    }
  };
  
  // Success Messages
  export const SUCCESS_MESSAGES = {
    AUTH: {
      LOGOUT: 'Successfully logged out',
      PASSWORD_RESET: 'Password reset successfully'
    },
    ROOM: {
      CREATED: 'Room created successfully',
      CLOSED: 'Room closed successfully'
    },
    VOTE: {
      CAST: 'Vote cast successfully'
    }
  };
  
  // API Metadata
  export const API = {
    VERSION: '1.0.0',
    BASE_PATH: '/api/v1',
    DOCS_PATH: '/api-docs'
  };
  
  // Environment Constants
  export const ENV = {
    PRODUCTION: 'production',
    DEVELOPMENT: 'development',
    TEST: 'test'
  };
  
  // Default Pagination
  export const PAGINATION = {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1
  };
  
  // Cache Control
  export const CACHE = {
    PUBLIC_MAX_AGE: 60 * 5, // 5 minutes
    PRIVATE_MAX_AGE: 60 * 60 // 1 hour
  };