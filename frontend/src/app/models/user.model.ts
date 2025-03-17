export interface User {
  id: number;
  email: string;
  name: string;
  lastName: string;
  role: 'admin' | 'user';
  dicose?: string;
  phone?: string;
} 