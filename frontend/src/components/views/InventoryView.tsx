import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Trash2, 
  Package, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  MapPin 
} from 'lucide-react';
import { 
  BoxesIcon, 
  ChartLineIcon, 
  ActivityIcon 
} from 'lucide-animated';
import { TypewriterText } from '../common/TypewriterText';
import { StaggerGrid, itemVariants } from '../common/StaggerGrid';
import { MorphButton } from '../common/MorphButton';
import { ScannedTitle } from '../common/ScannedTitle';
import { 
  getWarehouses, 
  getAllWarehouseInventory, 
  addWarehouseInventoryItem, 
  deleteWarehouseInventoryItem, 
  type Warehouse, 
  type WarehouseInventoryItem 
} from '../../api';

export default function InventoryView() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<WarehouseInventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('all');
  
  // Quick Add Form Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({ 
    name: '', 
    sku: '', 
    category: 'Electronics & Hardware', 
    quantity: 150, 
    unit_price: 2400, 
    warehouse_id: 1 
  });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [whData, invData] = await Promise.all([
        getWarehouses().catch(() => []),
        getAllWarehouseInventory().catch(() => [])
      ]);
      setWarehouses(whData);
      setInventory(invData);
      if (whData.length > 0) {
        setNewProd(prev => prev.warehouse_id ? prev : ({ ...prev, warehouse_id: whData[0].id }));
      }
    } catch (err) {
      console.error('Error loading inventory data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name.trim()) return;

    setIsSaving(true);
    setFeedback(null);
    setErrorFeedback(null);

    try {
      const targetWarehouseId = Number(newProd.warehouse_id) || 1;
      const added = await addWarehouseInventoryItem(targetWarehouseId, {
        name: newProd.name.trim(),
        sku: newProd.sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: newProd.category,
        quantity: Number(newProd.quantity) || 1,
        unit_price: Number(newProd.unit_price) || 0,
        status: Number(newProd.quantity) > 50 ? 'In Stock' : 'Low Stock'
      });

      const wh = warehouses.find(w => w.id === targetWarehouseId);
      const enrichedItem: WarehouseInventoryItem = {
        ...added,
        warehouse_name: wh ? wh.name : `Hub #${targetWarehouseId}`,
        warehouse_city: wh ? wh.city : 'City Hub'
      };

      setInventory(prev => [enrichedItem, ...prev]);
      setFeedback(`SKU "${added.name}" registered to ${wh?.city || 'warehouse'}!`);
      
      setNewProd({
        name: '',
        sku: '',
        category: 'Electronics & Hardware',
        quantity: 150,
        unit_price: 2400,
        warehouse_id: targetWarehouseId
      });

      setTimeout(() => {
        setShowAddModal(false);
        setFeedback(null);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorFeedback(msg || 'Failed to persist item to database');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!window.confirm('Confirm deletion of this inventory item from the database?')) return;
    try {
      await deleteWarehouseInventoryItem(itemId);
      setInventory(prev => prev.filter(i => i.id !== itemId));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg || 'Failed to remove inventory SKU');
    }
  };

  // Filtered inventory list
  const filtered = useMemo(() => {
    return inventory.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.warehouse_city && p.warehouse_city.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesWarehouse = 
        selectedWarehouseFilter === 'all' || 
        String(p.warehouse_id) === selectedWarehouseFilter;

      return matchesSearch && matchesWarehouse;
    });
  }, [inventory, searchTerm, selectedWarehouseFilter]);

  // Aggregate metrics
  const totalValuation = useMemo(() => {
    return inventory.reduce((acc, item) => acc + (item.quantity * (item.unit_price || 0)), 0);
  }, [inventory]);

  const totalQuantity = useMemo(() => {
    return inventory.reduce((acc, item) => acc + item.quantity, 0);
  }, [inventory]);

  const lowStockCount = useMemo(() => {
    return inventory.filter(item => item.quantity > 0 && item.quantity <= 50).length;
  }, [inventory]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="chip ok">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc84] animate-ping" />
              Relational Database Catalog
            </span>
            <span className="font-mono text-xs text-[#7f8a79]">
              ● MySQL Inventory Table · Real-Time Stock
            </span>
          </div>

          <ScannedTitle>
            <h1 className="font-['Syne'] font-extrabold uppercase text-4xl sm:text-6xl tracking-tight leading-none">
              INVENTORY<br />
              <span className="text-[#c8ff2e]">&amp; STOCK</span>
            </h1>
          </ScannedTitle>

          <p className="font-mono text-xs text-[#7f8a79] mt-3 max-w-xl">
            <TypewriterText text="SKU INVENTORY MATRIX · LIVE STOCK LEVELS · 14 FACILITY SYNC" className="font-mono text-xs text-[#7f8a79]" />
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <MorphButton
            label="Refresh"
            loadingLabel="Syncing..."
            successLabel="Synced ✓"
            errorLabel="Error ✗"
            onClick={loadData}
            disabled={loading}
            variant="dark"
            className="min-w-[120px] py-3 text-xs"
            icon={<RefreshCw size={13} className="mr-1" />}
          />

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-volt primary px-6 py-3 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
            data-mag
          >
            <BoxesIcon size={16} animateOnHover={true} />
            + Add SKU Item
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRICS CARDS */}
      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <motion.div variants={itemVariants} className="card-bento p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Active Catalog Items
            </span>
            <BoxesIcon size={16} className="text-[#eef2e6]" animateOnHover={true} />
          </div>
          <div className="font-['Syne'] font-extrabold text-4xl text-[#eef2e6] leading-none">
            {inventory.length}
          </div>
          <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
            Tracked Relational SKUs
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="card-bento p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Total Stock Quantity
            </span>
            <BoxesIcon size={16} className="text-[#3ddc84]" animateOnHover={true} />
          </div>
          <div className="font-['Syne'] font-extrabold text-4xl text-[#3ddc84] leading-none">
            {totalQuantity.toLocaleString()}
          </div>
          <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
            Pallets &amp; Cargo Units
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="card-bento p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Network Valuation
            </span>
            <ChartLineIcon size={16} className="text-[#c8ff2e]" animateOnHover={true} />
          </div>
          <div className="font-['Syne'] font-extrabold text-4xl text-[#c8ff2e] leading-none">
            ₹{(totalValuation / 1000000).toFixed(2)}M
          </div>
          <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
            Total Inventory Worth
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="card-bento p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Low Stock Alerts
            </span>
            <ActivityIcon size={16} className="text-[#ff5a1f]" animateOnHover={true} />
          </div>
          <div className="font-['Syne'] font-extrabold text-4xl text-[#ff5a1f] leading-none">
            {lowStockCount}
          </div>
          <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
            Requires Reorder
          </span>
        </motion.div>

      </StaggerGrid>

      {/* 3. SEARCH & WAREHOUSE FILTER BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7f8a79]" />
          <input
            type="text"
            placeholder="Search SKU code, product name, city hub..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-dark pl-10 text-xs font-mono w-full"
          />
        </div>

        {/* Warehouse Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none font-mono text-xs">
          <span className="text-[#7f8a79] uppercase text-[10px] tracking-wider shrink-0 mr-1">
            Facility:
          </span>
          <button
            onClick={() => setSelectedWarehouseFilter('all')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold shrink-0 transition ${
              selectedWarehouseFilter === 'all'
                ? 'bg-[#c8ff2e] text-[#06080a] border-[#c8ff2e]'
                : 'bg-[#0d1114] text-[#7f8a79] border-white/10 hover:text-white'
            }`}
          >
            All ({inventory.length})
          </button>
          {warehouses.map(w => (
            <button
              key={w.id}
              onClick={() => setSelectedWarehouseFilter(String(w.id))}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold shrink-0 transition ${
                selectedWarehouseFilter === String(w.id)
                  ? 'bg-[#c8ff2e] text-[#06080a] border-[#c8ff2e]'
                  : 'bg-[#0d1114] text-[#7f8a79] border-white/10 hover:text-white'
              }`}
            >
              {w.city}
            </button>
          ))}
        </div>
      </div>

      {/* 4. INVENTORY DATA TABLE */}
      <div className="card-bento p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#06080a] border-b border-white/10 text-[10px] uppercase text-[#7f8a79] tracking-wider">
              <tr>
                <th className="py-4 px-5">SKU Code</th>
                <th className="py-4 px-5">Product Name</th>
                <th className="py-4 px-5">Warehouse Facility</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5 w-48">Stock Level</th>
                <th className="py-4 px-5 text-right">Units</th>
                <th className="py-4 px-5 text-right">Unit Price</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((item, idx) => {
                const wh = warehouses.find(w => w.id === item.warehouse_id);
                const isOut = item.quantity === 0;
                const isLow = item.quantity > 0 && item.quantity <= 50;
                const statusColor = isOut ? '#ff2d55' : isLow ? '#ff5a1f' : '#3ddc84';
                const statusLabel = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';
                const fillPct = Math.min(100, Math.round((item.quantity / 500) * 100));

                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }} className="hover:bg-white/[0.02] transition">
                    {/* SKU */}
                    <td className="py-4 px-5 font-bold text-[#c8ff2e]">
                      {item.sku}
                    </td>

                    {/* Product Name */}
                    <td className="py-4 px-5 font-bold text-white text-sm">
                      {item.name}
                    </td>

                    {/* Warehouse */}
                    <td className="py-4 px-5 text-[#b7c1ae]">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-[#c8ff2e]" />
                        <span>{wh?.city || item.warehouse_city || `Hub #${item.warehouse_id}`}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-5 text-[#7f8a79]">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px]">
                        {item.category}
                      </span>
                    </td>

                    {/* Stock Level Bar */}
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <div className="bar on h-1.5 rounded-full bg-white/5 overflow-visible relative">
                          <motion.div
                            className="h-full rounded-full bar-glow-head"
                            style={{ background: statusColor }}
                            initial={{ width: '0%' }}
                            animate={{ width: `${fillPct}%` }}
                            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                          />
                        </div>
                        <span className="text-[10px] text-[#7f8a79] block">
                          {item.quantity} / 500 Max Capacity
                        </span>
                      </div>
                    </td>

                    {/* Units */}
                    <td className="py-4 px-5 text-right font-bold text-[#eef2e6]">
                      {item.quantity.toLocaleString()}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-5 text-right font-bold text-[#3ddc84]">
                      ₹{item.unit_price?.toLocaleString()}
                    </td>

                    {/* Status Chip */}
                    <td className="py-4 px-5 text-center">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border inline-block"
                        style={{
                          color: statusColor,
                          borderColor: `${statusColor}40`,
                          background: `${statusColor}15`
                        }}
                      >
                        ● {statusLabel}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-[#7f8a79] hover:text-[#ff2d55] hover:bg-[#ff2d55]/10 transition"
                        title="Delete SKU from Database"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-[#7f8a79] font-mono text-xs space-y-2">
              <Package size={32} className="mx-auto text-[#7f8a79]/50" />
              <p>No inventory items match search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. ADD INVENTORY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-lg w-full card-bento p-6 border-[#c8ff2e]/40 shadow-2xl relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                  Database Write
                </span>
                <h3 className="font-['Syne'] font-extrabold text-2xl uppercase tracking-tight">
                  Register New SKU
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-[#7f8a79] hover:text-white hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            {feedback && (
              <div className="mb-4 p-3 rounded-xl bg-[#3ddc84]/10 border border-[#3ddc84]/30 text-[#3ddc84] font-mono text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{feedback}</span>
              </div>
            )}

            {errorFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-[#ff2d55]/10 border border-[#ff2d55]/30 text-[#ff2d55] font-mono text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorFeedback}</span>
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                  Product / SKU Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High-Power Solar Inverter 5kW"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="input-dark text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                    Custom SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SKU-8842"
                    value={newProd.sku}
                    onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                    className="input-dark text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                    Destination Hub *
                  </label>
                  <select
                    value={newProd.warehouse_id}
                    onChange={(e) => setNewProd({ ...newProd, warehouse_id: Number(e.target.value) })}
                    className="input-dark text-xs font-mono"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.city} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                    Category
                  </label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="input-dark text-xs font-mono"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Auto Parts">Auto Parts</option>
                    <option value="Renewable">Renewable</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Textiles">Textiles</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={newProd.quantity}
                    onChange={(e) => setNewProd({ ...newProd, quantity: Number(e.target.value) })}
                    className="input-dark text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                    Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProd.unit_price}
                    onChange={(e) => setNewProd({ ...newProd, unit_price: Number(e.target.value) })}
                    className="input-dark text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <MorphButton
                  label="Persist SKU to Warehouse →"
                  loadingLabel="Writing to MySQL..."
                  successLabel="SKU Persisted ✓"
                  errorLabel="Failed to Save ✗"
                  type="submit"
                  disabled={isSaving}
                  variant="volt-primary"
                  className="w-full py-3.5"
                />
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
