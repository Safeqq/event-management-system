export interface DashboardStats {
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
  totalTicketsSold: number;
}

export interface DashboardService {
  getStats(organizerId: string): Promise<DashboardStats>;
}
