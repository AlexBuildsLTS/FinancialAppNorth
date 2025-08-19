import { User, UserRole } from '@/context/AuthContext';

// Helper to generate a unique ID
const generateId = () => `USR_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

// Mock user database
const mockUsers: User[] = [
  {
    id: '1',
    uniqueUserId: generateId(),
    email: 'alex.member@northfinance.io',
    role: 'Member',
    displayName: 'Alex Member',
    avatarUrl: `https://i.pravatar.cc/150?u=alex.member@northfinance.io`,
  },
  {
    id: '2',
    uniqueUserId: generateId(),
    email: 'beta.premium@northfinance.io',
    role: 'Premium Member',
    displayName: 'Beta Premium',
    avatarUrl: `https://i.pravatar.cc/150?u=beta.premium@northfinance.io`,
  },
  {
    id: '3',
    uniqueUserId: generateId(),
    email: 'casey.cpa@northfinance.io',
    role: 'Professional Accountant',
    displayName: 'Casey CPA',
    avatarUrl: `https://i.pravatar.cc/150?u=casey.cpa@northfinance.io`,
  },
  {
    id: '4',
    uniqueUserId: generateId(),
    email: 'dylan.support@northfinance.io',
    role: 'Support',
    displayName: 'Dylan Support',
    avatarUrl: `https://i.pravatar.cc/150?u=dylan.support@northfinance.io`,
  },
  {
    id: '5',
    uniqueUserId: generateId(),
    email: 'elliot.admin@northfinance.io',
    role: 'Administrator',
    displayName: 'Elliot Admin',
    avatarUrl: `https://i.pravatar.cc/150?u=elliot.admin@northfinance.io`,
  },
];

// Simulates fetching all users from an API
export const fetchAllUsers = async (): Promise<User[]> => {
  console.log('Fetching all users...');
  // Simulate network delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockUsers);
    }, 500);
  });
};

// Simulates updating a user's role
export const updateUserRole = async (userId: string, newRole: UserRole): Promise<User> => {
    console.log(`Updating user ${userId} to role ${newRole}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                mockUsers[userIndex].role = newRole;
                resolve(mockUsers[userIndex]);
            } else {
                reject(new Error('User not found'));
            }
        }, 300);
    });
};