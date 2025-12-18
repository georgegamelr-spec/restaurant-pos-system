import { NextRequest, NextResponse } from 'next/server';
import { Order, BillSplitPerson, OrderItem, ApiResponse } from '@/types/restaurant';
import { orders } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, items, taxRate = 0.15 } = body;

    if (!tableId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ليبر جاد' },
        { status: 400 }
      );
    }

    const subtotal = items.reduce((sum: number, item: OrderItem) => sum + item.subtotal, 0);
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    const newOrder: Order = {
      id: Date.now().toString(),
      tableId,
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    orders.push(newOrder);

    return NextResponse.json({ success: true, data: newOrder });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');

    let result = orders;
    if (tableId) {
      result = orders.filter(o => o.tableId === tableId && o.status === 'open');
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action, splitDetails } = body;

    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 });
    }

    if (action === 'split') {
      order.splitDetails = splitDetails;
      order.updatedAt = new Date();
    } else if (action === 'settle') {
      order.status = 'completed';
      order.completedAt = new Date();
      order.updatedAt = new Date();
    } else if (action === 'transfer') {
      const { newTableId } = body;
      order.tableId = newTableId;
      order.updatedAt = new Date();
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ' }, { status: 500 });
  }
}
