import React from 'react';
import { Briefcase, Car, Home, Coffee, ShoppingBag } from 'lucide-react-native';
import { ColorScheme } from '@/theme/colors';

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  time: string;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'failed';
  icon: React.ReactNode;
}

const transactionIcons: { [key: string]: React.ElementType } = {
  Groceries: ShoppingBag,
  Salary: Briefcase,
  Transportation: Car,
  'Food & Dining': Coffee,
  Housing: Home,
};

function getTransactionIcon(category: string, colors: ColorScheme): React.ReactNode {
  const IconComponent = transactionIcons[category] || ShoppingBag;
  let color = colors.primary;
  switch (category) {
    case 'Salary':
      color = colors.success;
      break;
    case 'Transportation':
      color = colors.warning;
      break;
    case 'Food & Dining':
      color = colors.purple; // Use palette color explicitly
      break;
    case 'Housing':
      color = colors.error;
      break;
  }
  return <IconComponent size={20} color={color} />;
}

export async function fetchTransactions(colors: ColorScheme): Promise<Transaction[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          title: 'Whole Foods Market',
          category: 'Groceries',
          amount: -156.5,
          date: 'Aug 15',
          type: 'expense',
          icon: getTransactionIcon('Groceries', colors),
          time: '',
          status: 'completed',
        },
        {
          id: '2',
          title: 'Monthly Salary',
          category: 'Salary',
          amount: 5200.0,
          date: 'Aug 15',
          type: 'income',
          icon: getTransactionIcon('Salary', colors),
          time: '',
          status: 'completed',
        },
        {
          id: '3',
          title: 'Shell Gas Station',
          category: 'Transportation',
          amount: -45.2,
          date: 'Aug 14',
          type: 'expense',
          icon: getTransactionIcon('Transportation', colors),
          time: '',
          status: 'completed',
        },
        {
          id: '4',
          title: 'Starbucks Coffee',
          category: 'Food & Dining',
          amount: -12.75,
          date: 'Aug 14',
          type: 'expense',
          icon: getTransactionIcon('Food & Dining', colors),
          time: '',
          status: 'pending',
        },
        {
          id: '5',
          title: 'Apartment Rent',
          category: 'Housing',
          amount: -1200.0,
          date: 'Aug 1',
          type: 'expense',
          icon: getTransactionIcon('Housing', colors),
          time: '',
          status: 'completed',
        },
      ]);
    }, 500);
  });
}
