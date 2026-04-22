import { NextRequest, NextResponse } from 'next/server';
import { Order, BillSplitPerson, OrderItem, ApiResponse } from '@/lib/types/restaurant';
import { orders } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, items, taxRate = 0.15 } = body;

    if (!tableId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'tableId and items are required and items cannot be empty' },
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
    console.error('POST /api/orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while creating order' },
      { status: 500 }
    );
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
    console.error('GET /api/orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while fetching orders' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action, splitDetails } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { success: false, error: 'orderId and action are required' },
        { status: 400 }
      );
    }

    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order with id '${orderId}' not found` },
        { status: 404 }
      );
    }

    if (action === 'split') {
      if (!splitDetails) {
        return NextResponse.json(
          { success: false, error: 'splitDetails is required for split action' },
          { status: 400 }
        );
      }
      order.splitDetails = splitDetails;
      order.updatedAt = new Date();
    } else if (action === 'settle') {
      order.status = 'completed';
      order.completedAt = new Date();
      order.updatedAt = new Date();
    } else if (action === 'transfer') {
      const { newTableId } = body;
      if (!newTableId) {
        return NextResponse.json(
          { success: false, error: 'newTableId is required for transfer action' },
          { status: 400 }
        );
      }
      order.tableId = newTableId;
      order.updatedAt = new Date();
    } else {
      return NextResponse.json(
        { success: false, error: `Unknown action '${action}'. Valid actions: split, settle, transfer` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('PATCH /api/orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while updating order' },
      { status: 500 }
    );
  }
}
