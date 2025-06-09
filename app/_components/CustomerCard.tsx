'use client';

import { memo } from 'react';
import { deleteCustomer, deleteTransaction } from '@/app/actions/customers';
import { AddTransactionForm } from './AddTransactionForm';
import { Button } from '@/components/ui/button';

type Transaction = {
  id: string;
  content: string;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  transactions: Transaction[];
};

type Props = { customer: Customer };

export const CustomerCard = memo(function CustomerCard({ customer }: Props) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between">
        <div>
          <p className="font-medium">{customer.name}</p>
          <p className="text-sm text-gray-500">{customer.email}</p>
        </div>
        <form
          action={async () => {
                       await deleteCustomer(customer.id);
          }}
          onSubmit={(e) => {
            if (!confirm('هل أنت متأكد من حذف العميل؟')) e.preventDefault();
          }}
        >
          <Button size="sm" variant="destructive">حذف العميل</Button>
        </form>
      </div>

      <div className="pl-4 border-l space-y-1">
        <p className="text-sm font-semibold">المعاملات:</p>
        {customer.transactions.map((t) => (
          <div key={t.id} className="flex justify-between text-sm bg-gray-100 p-1 rounded">
            <span>{t.content}</span>
            <form
              action={async () => {
                await deleteTransaction(t.id);
              }}
              onSubmit={(e) => {
                if (!confirm('حذف المعاملة؟')) e.preventDefault();
              }}
            >
              <Button variant="destructive" size="icon">✕</Button>
            </form>
          </div>
        ))}
        <AddTransactionForm customerId={customer.id} />
      </div>
    </div>
  );
});
