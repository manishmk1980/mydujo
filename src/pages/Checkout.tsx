import React from 'react';
import { CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

/**
 * Student-admin pay-fee page. Only real outstanding fees for logged-in student.
 * Empty state when none. No generic catalog or public checkout layout.
 */
export default function Checkout() {
  const outstandingFees: Array<{ id: string; label: string; amount: number }> = [];
  const hasOutstanding = outstandingFees.length > 0;

  return (
    <PageContainer>
      <PageHeader
        title="Pay Fee"
        description="Pay your outstanding dues. Your dojo manages fee records."
      />
      {hasOutstanding ? (
        <div className="space-y-6">
          {/* Future: list outstanding fees, payment form with real data */}
        </div>
      ) : (
        <EmptyState
          icon={CreditCard}
          title="No outstanding fees"
          description="You have no dues at the moment. Your dojo will update this when fees are due."
          action={
            <Link
              to="/payments"
              className="inline-block px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all"
            >
              View Payment History
            </Link>
          }
        />
      )}
    </PageContainer>
  );
}
