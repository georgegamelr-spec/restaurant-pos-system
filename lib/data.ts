import { Order, Table } from './types/restaurant';

// Mock data for orders - this would typically come from a database
export const orders: Order[] = [
  {
    id: '1',
    tableId: '1',
    items: [
      {
        id: '1',
        itemId: 'item-1',
        nameAr: 'مائدت بالدجاج',
        nameEn: 'Chicken Shawarma',
        quantity: 2,
        price: 45,
        subtotal: 90,
        notes: '',
      },
    ],
    subtotal: 90,
    taxRate: 0.15,
    taxAmount: 13.5,
    total: 103.5,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock data for tables - this would typically come from a database
export const tables: Table[] = [
  {
    id: '1',
    numberAr: 'الطاولة 1',
    numberEn: 'Table 1',
    capacity: 4,
    status: 'empty',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    numberAr: 'الطاولة 2',
    numberEn: 'Table 2',
    capacity: 6,
    status: 'empty',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    numberAr: 'الطاولة 3',
    numberEn: 'Table 3',
    capacity: 4,
    status: 'empty',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    numberAr: 'الطاولة 4',
    numberEn: 'Table 4',
    capacity: 8,
    status: 'empty',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
