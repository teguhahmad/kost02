export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  lastPaymentDate: string;
}

export interface Room {
  id: string;
  number: string;
  floor: string;
  type: 'single' | 'double' | 'deluxe';
  price: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  facilities: string[];
  tenantId?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  roomId: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
  notes?: string;
}

export interface MaintenanceRequest {
  id: string;
  roomId: string;
  tenantId?: string;
  title: string;
  description: string;
  date: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface FinancialSummary {
  totalRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  monthlyIncome: number;
}

export interface OccupancySummary {
  total: number;
  occupied: number;
  vacant: number;
  maintenance: number;
  occupancyRate: number;
}