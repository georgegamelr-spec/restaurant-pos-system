'use client';
import { useState, useMemo } from 'react';
import { ShoppingCart, Home, FileText, Menu as MenuIcon, Settings, LogOut, Search, User, ChevronLeft, ChevronRight, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, X, Check, Clock } from 'lucide-react';

type OrderStatus = 'all' | 'dine-in' | 'wait-list' | 'take-away' | 'saved';
type PaymentMethod = 'cash' | 'card' | 'digital';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  emoji: string;
}

interface CartItem extends MenuItem {
  qty: number;
}

interface TableOrder {
  id: string;
  tableNumber: string;
  status: OrderStatus;
  items: number;
  time: string;
  image: string;
}

const mockItems: MenuItem[] = [
  { id: 1, name: 'فراخ مشوي', price: 85, category: 'أطباق رئيسية', emoji: '🍗' },
  { id: 2, name: 'سمك مشوي', price: 95, category: 'أطباق رئيسية', emoji: '🐟' },
  { id: 3, name: 'كفتة', price: 75, category: 'أطباق رئيسية', emoji: '🍖' },
  { id: 4, name: 'بيتزا', price: 120, category: 'أطباق رئيسية', emoji: '🍕' },
  { id: 5, name: 'برجر', price: 60, category: 'أطباق جانبية', emoji: '🍔' },
  { id: 6, name: 'معكرونة', price: 65, category: 'أطباق جانبية', emoji: '🍝' },
  { id: 7, name: 'سلطة', price: 40, category: 'سلطات', emoji: '🥗' },
  { id: 8, name: 'عصير برتقال', price: 15, category: 'مشروبات', emoji: '🧃' },
  { id: 9, name: 'قهوة', price: 12, category: 'مشروبات', emoji: '☕' },
  { id: 10, name: 'كنافة', price: 45, category: 'حلويات', emoji: '🍮' },
  { id: 11, name: 'بسبوسة', price: 25, category: 'حلويات', emoji: '🍪' },
  { id: 12, name: 'ايس كريم', price: 20, category: 'حلويات', emoji: '🍨' },
];

const tableOrders: TableOrder[] = [
  { id: '1', tableNumber: '01', status: 'dine-in', items: 3, time: '10:35 صباحاً', image: '🍽️' },
  { id: '2', tableNumber: '05', status: 'dine-in', items: 5, time: '10:25 صباحاً', image: '🍽️' },
  { id: '3', tableNumber: '12', status: 'wait-list', items: 2, time: '10:05 صباحاً', image: '⏳' },
  { id: '4', tableNumber: '08', status: 'take-away', items: 4, time: '09:15 صباحاً', image: '📦' },
];

export default function CashierPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus>('all');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const categories = useMemo(() => {
    const unique = ['all', ...new Set(mockItems.map(i => i.category))];
    return unique;
  }, []);

  const filteredItems = useMemo(() => {
    return mockItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return tableOrders;
    return tableOrders.filter(order => order.status === activeTab);
  }, [activeTab]);

  const addItem = (item: MenuItem) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeItem = (id: number) => setCart(cart.filter(c => c.id !== id));

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) removeItem(id);
    else setCart(cart.map(c => c.id === id ? { ...c, qty } : c));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const handlePayment = async () => {
    setPaymentProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPaymentProcessing(false);
    setShowPaymentModal(false);
    setCart([]);
    alert('✅ تم إتمام الدفع بنجاح! الطلب: #' + Math.floor(Date.now() / 1000));
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white" dir="rtl">
      {/* Left Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-950 border-l border-gray-800 transition-all duration-300 flex flex-col shadow-2xl`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">نظام الكاشير</h1>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>

        <nav className="space-y-2 flex-1 p-4">
          {[
            { icon: Home, label: 'الرئيسية', color: 'text-blue-400' },
            { icon: FileText, label: 'الطلبات', color: 'text-purple-400' },
            { icon: MenuIcon, label: 'القائمة', color: 'text-green-400' },
            { icon: Settings, label: 'الإعدادات', color: 'text-orange-400' },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors group">
              <item.icon size={20} className={`${item.color} group-hover:scale-110 transition-transform`} />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <button className="m-4 flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-900/20 text-red-400 transition-colors group">
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          {sidebarOpen && <span className="text-sm">تسجيل الخروج</span>}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800 px-6 py-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={20} className="absolute right-3 top-3 text-gray-500" />
              <input type="text" placeholder="ابحث عن منتج..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-800 px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right px-4 py-2 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-400">{dateStr}</div>
              <div className="text-lg font-semibold">{timeStr}</div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all">
              <User size={18} />
              <span className="text-sm">أحمد محمود</span>
            </button>
          </div>
        </header>

        {/* Main 3-Column Layout */}
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          
          {/* Left Column: Orders */}
          <div className="w-72 bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col shadow-xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 border-b border-gray-700">
              <h2 className="font-bold text-sm">📋 الطلبات النشطة</h2>
            </div>

            <div className="flex gap-2 p-3 border-b border-gray-700 overflow-x-auto">
              {['all', 'dine-in', 'wait-list', 'take-away'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as OrderStatus)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                  {tab === 'all' && 'الكل'}{tab === 'dine-in' && 'داخلي'}{tab === 'wait-list' && 'انتظار'}{tab === 'take-away' && 'للحمل'}
                  {filteredOrders.length > 0 && <span className="mr-1 text-red-400">({filteredOrders.length})</span>}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 p-3">
              {filteredOrders.length > 0 ? filteredOrders.map(order => (
                <div key={order.id} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 hover:border-blue-500 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-blue-400 group-hover:text-blue-300">طاولة {order.tableNumber}</h3>
                      <p className="text-xs text-gray-400"><Clock size={12} className="inline mr-1" />{order.time}</p>
                    </div>
                    <span className="text-2xl">{order.image}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">عدد العناصر</span>
                    <span className="text-green-400 font-semibold">{order.items}</span>
                  </div>
                </div>
              )) : <div className="flex items-center justify-center h-full text-gray-500 text-sm">لا توجد طلبات</div>}
            </div>
          </div>

          {/* Center Column: Menu */}
          <div className="flex-1 bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 border-b border-gray-700">
              <h2 className="font-bold text-sm">🍽️ القائمة</h2>
            </div>

            <div className="flex gap-2 p-3 border-b border-gray-700 overflow-x-auto">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-xs whit
