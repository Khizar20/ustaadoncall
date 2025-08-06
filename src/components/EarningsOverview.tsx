import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Users, 
  Calendar,
  CreditCard,
  Smartphone,
  DollarSign as CashIcon,
  BarChart3,
  PieChart,
  Download,
  Eye
} from "lucide-react";
import { 
  getEarningsOverview, 
  getMonthlyEarnings, 
  getPaymentMethodBreakdown,
  getServiceCategoryEarnings,
  getRecentTransactions,
  debugBookings,
  formatCurrency,
  formatPercentage,
  type EarningsOverview,
  type MonthlyEarnings,
  type PaymentMethodBreakdown,
  type ServiceCategoryEarnings,
  type RecentTransaction
} from "@/lib/earningsService";

interface EarningsOverviewProps {
  providerId: string;
}

const EarningsOverview = ({ providerId }: EarningsOverviewProps) => {
  const [overview, setOverview] = useState<EarningsOverview | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarnings[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentMethodBreakdown[]>([]);
  const [serviceEarnings, setServiceEarnings] = useState<ServiceCategoryEarnings[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics'>('overview');

  useEffect(() => {
    const fetchEarningsData = async () => {
      setIsLoading(true);
      try {
        // Debug the booking data first
        await debugBookings(providerId);

        const [
          overviewData,
          monthlyData,
          paymentData,
          serviceData,
          transactionData
        ] = await Promise.all([
          getEarningsOverview(providerId),
          getMonthlyEarnings(providerId),
          getPaymentMethodBreakdown(providerId),
          getServiceCategoryEarnings(providerId),
          getRecentTransactions(providerId, 10)
        ]);

        setOverview(overviewData);
        setMonthlyEarnings(monthlyData);
        setPaymentBreakdown(paymentData);
        setServiceEarnings(serviceData);
        setRecentTransactions(transactionData);
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (providerId) {
      fetchEarningsData();
    }
  }, [providerId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMonthName = (monthKey: string) => {
    const date = new Date(monthKey + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'visa_debit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'easypaisa':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <CashIcon className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No earnings data available</h3>
            <p className="text-muted-foreground">
              Your earnings data will appear here once you start completing orders.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'transactions' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('transactions')}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Transactions
        </Button>
        <Button
          variant={activeTab === 'analytics' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('analytics')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(overview.totalEarnings)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(overview.thisMonthEarnings)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(overview.pendingPayments)}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Booking Value</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(overview.averageBookingValue)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Earnings Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Earnings (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyEarnings.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{getMonthName(month.month)}</p>
                      <p className="text-sm text-muted-foreground">
                        {month.bookings} booking{month.bookings !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(month.earnings)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Payment Method Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentBreakdown.map((method) => (
                  <div key={method.method} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getPaymentMethodIcon(method.method)}
                      <div>
                        <p className="font-medium">{method.methodName}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.bookings} booking{method.bookings !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(method.earnings)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPercentage(method.percentage)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Transactions</span>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No completed transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          {getPaymentMethodIcon(transaction.payment_method_name.toLowerCase().includes('card') ? 'visa_debit_card' : 
                            transaction.payment_method_name.toLowerCase().includes('easypaisa') ? 'easypaisa' : 'cash_on_delivery')}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.user_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.booking_date)} • {transaction.service_location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(transaction.total_amount)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.payment_method_name}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Service Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Service Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {serviceEarnings.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No service category data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {serviceEarnings.map((service) => (
                    <div key={service.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{service.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.bookings} booking{service.bookings !== 1 ? 's' : ''} • 
                          Avg: {formatCurrency(service.averageValue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(service.earnings)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Bookings</span>
                  <span className="font-medium">{overview.totalBookings}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Bookings</span>
                  <span className="font-medium text-green-600">{overview.completedBookings}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Rate</span>
                  <span className="font-medium">
                    {overview.totalBookings > 0 
                      ? formatPercentage((overview.completedBookings / overview.totalBookings) * 100)
                      : '0%'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Revenue</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(overview.totalEarnings)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Average</span>
                  <span className="font-medium">
                    {formatCurrency(overview.totalEarnings / 6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Revenue</span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(overview.pendingPayments)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsOverview; 