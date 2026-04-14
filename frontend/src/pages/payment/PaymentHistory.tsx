import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Loader from '../../components/ui/Loader';
import { Receipt, CheckCircle, Clock, XCircle, MapPin, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentRecord {
  id: string;
  amount: number;
  status: string;
  provider: string;
  createdAt: string;
  orderId: string;
  booking?: {
    id: string;
    startDate: string;
    endDate: string;
    property?: {
      id: string;
      title: string;
      city: string;
      images?: string[];
    };
  };
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  INITIATED: { color: '#f59e0b', icon: <Clock size={14} />, label: 'Initiated' },
  SUCCESS: { color: '#22c55e', icon: <CheckCircle size={14} />, label: 'Paid' },
  FAILED: { color: '#ef4444', icon: <XCircle size={14} />, label: 'Failed' },
  REFUNDED: { color: '#6366f1', icon: <Receipt size={14} />, label: 'Refunded' },
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/payment/my-history')
      .then((res) => setPayments(res.data?.payments || []))
      .catch(() => toast.error('Failed to load payment history'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loader size="lg" text="Loading payment history..." />;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn btn-ghost mb-6">
        <ChevronLeft size={18} className="mr-1" /> Back
      </button>

      <div className="page-header mb-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Receipt size={28} color="var(--primary-600)" />
          <div>
            <h1 className="page-title">Payment History</h1>
            <p className="page-subtitle">{payments.length} transaction{payments.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="empty-state">
          <Receipt size={40} />
          <h3 className="empty-state-title">No payments yet</h3>
          <p className="empty-state-description">Your completed transactions will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {payments.map((p) => {
            const sc = statusConfig[p.status] || statusConfig.INITIATED;
            const property = p.booking?.property;
            return (
              <div
                key={p.id}
                className="card"
                style={{ display: 'grid', gridTemplateColumns: property?.images?.[0] ? '120px 1fr' : '1fr', gap: '1rem', overflow: 'hidden', cursor: property ? 'pointer' : 'default' }}
                onClick={() => property && navigate(`/properties/${property.id}`)}
              >
                {property?.images?.[0] && (
                  <div
                    style={{
                      height: '100%',
                      minHeight: '100px',
                      backgroundImage: `url(${property.images[0]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.25rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
                        {property?.title || 'Booking Payment'}
                      </h3>
                      {property?.city && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={12} /> {property.city}
                        </p>
                      )}
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: `${sc.color}20`,
                        color: sc.color,
                      }}
                    >
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {p.provider}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
