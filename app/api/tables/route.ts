import { NextRequest, NextResponse } from 'next/server';
import { Table, ApiResponse } from '../../lib/types/restaurant.ts';
  { id: '1', numberAr: 'الأولى', numberEn: 'Table 1', capacity: 4, status: 'empty', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', numberAr: 'الثانية', numberEn: 'Table 2', capacity: 6, status: 'empty', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', numberAr: 'الثالثة', numberEn: 'Table 3', capacity: 4, status: 'empty', createdAt: new Date(), updatedAt: new Date() },
  { id: '4', numberAr: 'الرابعة', numberEn: 'Table 4', capacity: 8, status: 'empty', createdAt: new Date(), updatedAt: new Date() },
];

export async function GET() {
  try {
    const response: ApiResponse<Table[]> = {
      success: true,
      data: tables,
      message: 'تم استرجاع الترابيزات' 
    };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في استرجاع البيانات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { numberAr, numberEn, capacity } = body;
    
    if (!numberAr || !numberEn || !capacity) {
      return NextResponse.json(
        { success: false, error: 'هذه الحقول مطلوبة: numberAr, numberEn, capacity' },
        { status: 400 }
      );
    }
    
    const newTable: Table = {
      id: Date.now().toString(),
      numberAr,
      numberEn,
      capacity: Number(capacity),
      status: 'empty',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    tables.push(newTable);
    
    return NextResponse.json({
      success: true,
      data: newTable,
      message: 'تم إضافة الترابيزة بنجاح'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في إضافة الترابيزة' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('id');
    
    if (!tableId) {
      return NextResponse.json({ success: false, error: 'معرف الترابيزة مطلوب' }, { status: 400 });
    }
    
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) {
      return NextResponse.json({ success: false, error: 'الترابيزة غير موجودة' }, { status: 404 });
    }
    
    const deletedTable = tables.splice(tableIndex, 1);
    
    return NextResponse.json({
      success: true,
      data: deletedTable[0],
      message: 'تم حذف الترابيزة بنجاح'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في حذف الترابيزة' }, { status: 500 });
  }
}
