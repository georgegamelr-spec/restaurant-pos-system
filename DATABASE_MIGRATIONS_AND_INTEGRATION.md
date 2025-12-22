# Database Migrations and Inventory Integration

## Overview
This document outlines the database schema, migrations, and inventory integration triggers for the Purchase Order Management system.

## Database Tables

### suppliers
```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  payment_terms INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);
```

### purchase_orders
```sql
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'cancelled')),
  expected_delivery_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### purchase_order_items
```sql
CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### purchase_receipts
```sql
CREATE TABLE purchase_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  received_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'received',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### receipt_items
```sql
CREATE TABLE receipt_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID NOT NULL REFERENCES purchase_receipts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity_received INTEGER NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

```sql
-- Performance optimization indexes
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_created_at ON purchase_orders(created_at);
CREATE INDEX idx_purchase_order_items_po ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_product ON purchase_order_items(product_id);
CREATE INDEX idx_receipts_po ON purchase_receipts(purchase_order_id);
CREATE INDEX idx_receipt_items_receipt ON receipt_items(receipt_id);
CREATE INDEX idx_suppliers_created_at ON suppliers(created_at);
```

## Row Level Security (RLS) Policies

### suppliers table
```sql
-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Managers and Admins can read all suppliers
CREATE POLICY supplier_read_policy ON suppliers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'manager'))
    )
  );

-- Only Admins and Managers can create/update/delete
CREATE POLICY supplier_write_policy ON suppliers
  FOR INSERT, UPDATE, DELETE
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'manager'))
    )
  );
```

### purchase_orders table
```sql
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY purchase_order_read_policy ON purchase_orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'manager', 'purchaser'))
    )
  );

CREATE POLICY purchase_order_write_policy ON purchase_orders
  FOR INSERT, UPDATE, DELETE
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'manager', 'purchaser'))
    )
  );
```

## Inventory Integration Triggers

### Automatic Inventory Updates on Receipt
When a purchase receipt is created, inventory is automatically updated:

```typescript
// This is handled in app/api/receipts/route.ts POST handler
// For each receipt item:
// 1. Find current inventory quantity
// 2. Add received quantity
// 3. Update inventory record
// 4. Create inventory transaction log
```

### Inventory Transaction History
```sql
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('purchase', 'sales', 'adjustment', 'return')),
  quantity_change INTEGER NOT NULL,
  reference_table VARCHAR(100),
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(created_at);
```

## Data Flow

1. **Create Purchase Order**
   - Supplier is selected
   - Order items with quantities and costs are defined
   - Status: `pending`
   - Total amount is calculated automatically

2. **Receive Goods**
   - Receipt is created against purchase order
   - For each item in receipt:
     - Quantity received is recorded
     - Inventory is updated automatically
     - Inventory transaction log entry is created
   - Purchase order status changes to: `received`

3. **Inventory Tracking**
   - Real-time inventory visibility
   - Transaction history for auditing
   - Low stock alerts (future enhancement)

## Testing Checklist

- [ ] Create supplier
- [ ] Create purchase order with multiple items
- [ ] Verify order total calculation
- [ ] Receive partial shipment
- [ ] Verify inventory updates
- [ ] Check transaction history
- [ ] Test RBAC permissions
- [ ] Verify RLS policies
- [ ] Test error handling
- [ ] Load test with large datasets

## Future Enhancements

- [ ] Automated low stock alerts
- [ ] Multi-warehouse inventory tracking
- [ ] Supplier performance analytics
- [ ] Purchase order forecasting
- [ ] Barcode/SKU scanning integration
- [ ] Mobile app for goods receipt
