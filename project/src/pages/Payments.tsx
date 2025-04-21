import React, { useState } from 'react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import PaymentForm from '../components/payments/PaymentForm';
import PaymentDetails from '../components/payments/PaymentDetails';
import { Payment } from '../types';
import { payments, tenants, rooms } from '../data/mockData';
import { formatCurrency, formatDate, getPaymentStatusColor } from '../utils/formatters';
import { Plus, Search, Filter, Download, Calendar, ArrowDownUp, CreditCard, AlertTriangle, Clock, MessageCircle } from 'lucide-react';

const Payments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>();
  const [allPayments, setAllPayments] = useState(payments);
  
  const enhancedPayments = allPayments.map(payment => {
    const tenant = tenants.find(t => t.id === payment.tenantId);
    const room = rooms.find(r => r.id === payment.roomId);
    
    return {
      ...payment,
      tenantName: tenant ? tenant.name : 'Unknown',
      roomNumber: room ? room.number : 'Unknown'
    };
  });

  const totalPaid = enhancedPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = enhancedPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOverdue = enhancedPayments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const filteredPayments = enhancedPayments.filter(payment => {
    const matchesSearch = 
      payment.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.roomNumber.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    const matchesDateRange = !dateRange.start || !dateRange.end || (
      payment.dueDate >= dateRange.start && payment.dueDate <= dateRange.end
    );
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const generateWhatsAppMessage = (payment: Payment & { tenantName: string; roomNumber: string }) => {
    const tenant = tenants.find(t => t.id === payment.tenantId);
    const dueDate = new Date(payment.dueDate);
    const month = dueDate.toLocaleString('default', { month: 'long' });
    const year = dueDate.getFullYear();
    const propertyName = "KostManager Property"; // You can make this dynamic later

    let message = '';

    switch (payment.status) {
      case 'paid':
        message = `Halo ${payment.tenantName},\n\nTerima kasih telah menyelesaikan pembayaran sewa untuk periode ${month} ${year}. Kami sangat menghargai ketepatan Anda dalam melakukan pembayaran.\n\nBerikut adalah kwitansi pembayaran Anda:\n[Link Kwitansi]\n\nJika ada pertanyaan atau membutuhkan bantuan lebih lanjut, jangan ragu untuk menghubungi kami.\n\nSalam hangat,\nManajemen ${propertyName}`;
        break;
      case 'pending':
        message = `Halo ${payment.tenantName},\n\nKami ingin mengingatkan bahwa pembayaran sewa untuk periode ${month} ${year} masih belum diterima. Berikut adalah rincian tagihan Anda:\n\n[Link invoice]\n\nMohon segera menyelesaikan pembayaran paling lambat ${formatDate(payment.dueDate)}. Jika Anda membutuhkan informasi tambahan atau bantuan terkait pembayaran, silakan hubungi kami.\n\nTerima kasih atas perhatiannya.\n\nSalam hangat,\nManajemen ${propertyName}`;
        break;
      case 'overdue':
        message = `Halo ${payment.tenantName},\n\nKami mencatat bahwa pembayaran sewa untuk periode ${month} ${year} belum diterima hingga saat ini. Pembayaran telah melewati batas waktu yang ditentukan pada ${formatDate(payment.dueDate)}.\n\nMohon segera menyelesaikan pembayaran Anda untuk menghindari denda keterlambatan atau tindakan lebih lanjut. Jika Anda mengalami kendala, silakan segera hubungi kami agar kami dapat membantu mencari solusi.\n\nTerima kasih atas perhatian dan kerja sama Anda.\n\nSalam hangat,\nManajemen ${propertyName}`;
        break;
    }

    return encodeURIComponent(message);
  };

  const handleWhatsAppClick = (payment: Payment & { tenantName: string; roomNumber: string }) => {
    const tenant = tenants.find(t => t.id === payment.tenantId);
    if (tenant) {
      const message = generateWhatsAppMessage(payment);
      const phoneNumber = tenant.phone.startsWith('0') ? '62' + tenant.phone.slice(1) : tenant.phone;
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    }
  };

  const handleRecordPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentForm(true);
    setShowPaymentDetails(false);
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
    setShowPaymentForm(false);
  };

  const handlePaymentSubmit = (data: Partial<Payment>) => {
    if (selectedPayment) {
      const updatedPayments = allPayments.map(p => 
        p.id === selectedPayment.id 
          ? { ...p, ...data, status: 'paid' }
          : p
      );
      setAllPayments(updatedPayments);
    } else {
      const newPayment: Payment = {
        id: Math.random().toString(36).substr(2, 9),
        ...data as Omit<Payment, 'id'>
      };
      setAllPayments([...allPayments, newPayment]);
    }
    setShowPaymentForm(false);
    setSelectedPayment(undefined);
  };

  const handleExport = () => {
    const headers = ['Tenant', 'Room', 'Amount', 'Due Date', 'Payment Date', 'Status', 'Payment Method', 'Notes'];
    const rows = filteredPayments.map(payment => [
      payment.tenantName,
      `Room ${payment.roomNumber}`,
      payment.amount.toString(),
      payment.dueDate,
      payment.date || '',
      payment.status,
      payment.paymentMethod || '',
      payment.notes || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Paid</p>
                <p className="mt-1 text-2xl font-semibold text-green-900">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full text-green-600">
                <CreditCard size={24} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending Payments</p>
                <p className="mt-1 text-2xl font-semibold text-yellow-900">{formatCurrency(totalPending)}</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-full text-yellow-600">
                <Clock size={24} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue Payments</p>
                <p className="mt-1 text-2xl font-semibold text-red-900">{formatCurrency(totalOverdue)}</p>
              </div>
              <div className="p-3 bg-red-200 rounded-full text-red-600">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Payment Records</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <Button icon={<Plus size={16} />} onClick={() => setShowPaymentForm(true)}>
              Record Payment
            </Button>
          </div>
        </CardHeader>

        <div className="px-6 pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={statusFilter === 'all' ? 'primary' : 'outline'} 
                size="sm" 
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={statusFilter === 'paid' ? 'primary' : 'outline'} 
                size="sm" 
                onClick={() => setStatusFilter('paid')}
              >
                Paid
              </Button>
              <Button 
                variant={statusFilter === 'pending' ? 'primary' : 'outline'} 
                size="sm" 
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
              <Button 
                variant={statusFilter === 'overdue' ? 'primary' : 'outline'} 
                size="sm" 
                onClick={() => setStatusFilter('overdue')}
              >
                Overdue
              </Button>
            </div>
            
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="outline" size="sm" icon={<Download size={16} />} onClick={handleExport}>
                Export
              </Button>
            </div>
          </div>
        </div>
        
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer hover:text-gray-700">
                    Tenant
                    <ArrowDownUp size={14} className="ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer hover:text-gray-700">
                    Room
                    <ArrowDownUp size={14} className="ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer hover:text-gray-700">
                    Amount
                    <ArrowDownUp size={14} className="ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer hover:text-gray-700">
                    Due Date
                    <ArrowDownUp size={14} className="ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer hover:text-gray-700">
                    Payment Date
                    <ArrowDownUp size={14} className="ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{payment.tenantName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">Room {payment.roomNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{formatDate(payment.dueDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{payment.date ? formatDate(payment.date) : '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getPaymentStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {payment.status === 'pending' || payment.status === 'overdue' ? (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleRecordPayment(payment)}
                            >
                              Record Payment
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<MessageCircle size={14} />}
                              onClick={() => handleWhatsAppClick(payment)}
                            >
                              WhatsApp
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(payment)}
                            >
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<MessageCircle size={14} />}
                              onClick={() => handleWhatsAppClick(payment)}
                            >
                              WhatsApp
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No payment records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {showPaymentForm && (
        <PaymentForm
          payment={selectedPayment}
          tenants={tenants}
          rooms={rooms}
          onSubmit={handlePaymentSubmit}
          onClose={() => {
            setShowPaymentForm(false);
            setSelectedPayment(undefined);
          }}
        />
      )}

      {showPaymentDetails && selectedPayment && (
        <PaymentDetails
          payment={selectedPayment}
          tenantName={enhancedPayments.find(p => p.id === selectedPayment.id)?.tenantName}
          roomNumber={enhancedPayments.find(p => p.id === selectedPayment.id)?.roomNumber}
          onClose={() => {
            setShowPaymentDetails(false);
            setSelectedPayment(undefined);
          }}
        />
      )}
    </div>
  );
};

export default Payments;