import { User, BotSession, Message } from '@/types';

// In-memory storage (for Vercel serverless compatibility)
// In production, replace with database (e.g., PostgreSQL, MongoDB)

const users: Map<string, User> = new Map();
const sessions: Map<string, BotSession> = new Map();
const messages: Map<string, Message[]> = new Map();
const tokens: Map<string, string> = new Map(); // token -> userId

export const db = {
  users: {
    create: (user: User) => {
      users.set(user.id, user);
      return user;
    },
    findById: (id: string): User | undefined => users.get(id),
    findByPhoneNumber: (phoneNumber: string): User | undefined => {
      for (const user of users.values()) {
        if (user.phoneNumber === phoneNumber) return user;
      }
      return undefined;
    },
    findAll: (): User[] => Array.from(users.values()),
  },

  sessions: {
    create: (session: BotSession) => {
      sessions.set(session.userId, session);
      return session;
    },
    findByUserId: (userId: string): BotSession | undefined => sessions.get(userId),
    update: (userId: string, updates: Partial<BotSession>) => {
      const session = sessions.get(userId);
      if (session) {
        const updated = { ...session, ...updates };
        sessions.set(userId, updated);
        return updated;
      }
      return undefined;
    },
    delete: (userId: string) => sessions.delete(userId),
  },

  messages: {
    add: (userId: string, message: Message) => {
      const userMessages = messages.get(userId) || [];
      userMessages.unshift(message);
      messages.set(userId, userMessages);
      return message;
    },
    findByUserId: (userId: string, limit = 50): Message[] => {
      const userMessages = messages.get(userId) || [];
      return userMessages.slice(0, limit);
    },
    clear: (userId: string) => messages.delete(userId),
  },

  tokens: {
    create: (token: string, userId: string) => {
      tokens.set(token, userId);
      return token;
    },
    verify: (token: string): string | undefined => tokens.get(token),
    delete: (token: string) => tokens.delete(token),
  },
};

// Helper to generate unique IDs
export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to generate auth token
export const generateToken = (userId: string) => {
  const token = `tok_${generateId()}`;
  tokens.set(token, userId);
  return token;
};
