import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Search, 
  Layers,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react';
import { 
  DatabaseIcon, 
  ShieldCheckIcon, 
  ActivityIcon 
} from 'lucide-animated';
import { StaggerGrid, itemVariants } from '../common/StaggerGrid';
import { TypewriterText } from '../common/TypewriterText';
import { MorphButton } from '../common/MorphButton';
import { ScannedTitle } from '../common/ScannedTitle';
import { getDatabaseSnapshot, type DatabaseSnapshot } from '../../api';

function CopyCell({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <span
      onClick={handleCopy}
      className="cursor-pointer group/copy relative inline-flex items-center gap-1.5 font-bold text-[#c8ff2e] hover:underline"
      title="Click to copy"
    >
      <span>{value}</span>
      <span className="opacity-0 group-hover/copy:opacity-100 transition-opacity text-[#7f8a79] hover:text-[#c8ff2e]">
        {copied ? <Check size={11} className="text-[#3ddc84]" /> : <Copy size={11} />}
      </span>
      <AnimatePresence>
        {copied && (
          <motion.span
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -16, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute left-0 -top-1 bg-[#c8ff2e] text-[#06080a] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(200,255,46,0.6)] pointer-events-none z-30"
          >
            ✓ Copied
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export default function DatabaseLiveView() {
  const [snapshot, setSnapshot] = useState<DatabaseSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTable, setActiveTable] = useState<'warehouses' | 'inventory' | 'orders' | 'edges' | 'users'>('warehouses');
  const [search, setSearch] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const fetchSnapshot = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDatabaseSnapshot();
      setSnapshot(data);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Failed to load database snapshot:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  const currentRows = snapshot?.tables?.[activeTable]?.rows || [];

  const filteredRows = currentRows.filter(row => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return Object.values(row).some(val => 
      val !== null && val !== undefined && String(val).toLowerCase().includes(q)
    );
  });

  const tableKeys = currentRows.length > 0 ? Object.keys(currentRows[0]) : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="chip v">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff2e] animate-ping" />
              Hybrid Storage Architecture
            </span>
            <span className="font-mono text-xs text-[#7f8a79]">
              ● MySQL 8.0 Relational Pool + MongoDB Audit Stream
            </span>
          </div>

          <ScannedTitle>
            <h1 className="font-['Syne'] font-extrabold uppercase text-4xl sm:text-6xl tracking-tight leading-none">
              DATABASE<br />
              <span className="text-[#c8ff2e]">LIVE EXPLORER</span>
            </h1>
          </ScannedTitle>

          <p className="font-mono text-xs text-[#7f8a79] mt-3 max-w-xl">
            <TypewriterText text="MYSQL LIVE INSPECTOR · ZERO REPLICATION LAG · ROLE-SCOPED VIEWS" className="font-mono text-xs text-[#7f8a79]" />
          </p>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs text-right hidden sm:block">
            <span className="text-[#7f8a79] block text-[10px] uppercase">Last Synchronized</span>
            <span className="text-white font-bold">{lastRefreshed || 'Connecting...'}</span>
          </div>

          <MorphButton
            label="Refresh Tables"
            loadingLabel="Synchronizing..."
            successLabel="Tables Synced ✓"
            errorLabel="Sync Failed ✗"
            onClick={fetchSnapshot}
            disabled={loading}
            variant="volt-primary"
            icon={<RefreshCw size={13} className="mr-1" />}
          />
        </div>
      </div>

      {/* 2. ENGINE STATUS & METRICS ROW */}
      <StaggerGrid className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <motion.div variants={itemVariants} className="card-bento p-5 flex items-center gap-3">
          <div className="p-3 bg-[#c8ff2e]/10 text-[#c8ff2e] rounded-xl shrink-0">
            <DatabaseIcon size={20} animateOnHover={true} />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-[#7f8a79] block">Engine Mode</span>
            <span className="font-mono text-xs font-bold text-white">
              {snapshot?.connected ? 'MySQL Live Pool' : 'In-Memory Resilient DB'}
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card-bento p-5 flex items-center gap-3">
          <div className="p-3 bg-[#00f0ff]/10 text-[#00f0ff] rounded-xl shrink-0">
            <DatabaseIcon size={20} animateOnHover={true} />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-[#7f8a79] block">MongoDB Telemetry</span>
            <span className="font-mono text-xs font-bold text-[#3ddc84]">
              ● Connected &amp; Synced
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card-bento p-5 flex items-center gap-3">
          <div className="p-3 bg-[#3ddc84]/10 text-[#3ddc84] rounded-xl shrink-0">
            <ShieldCheckIcon size={20} animateOnHover={true} />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-[#7f8a79] block">Security Isolation</span>
            <span className="font-mono text-xs font-bold text-white">
              Role Scoped SQL Views
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card-bento p-5 flex items-center gap-3">
          <div className="p-3 bg-[#ff5a1f]/10 text-[#ff5a1f] rounded-xl shrink-0">
            <ActivityIcon size={20} animateOnHover={true} />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-[#7f8a79] block">Table Rows Cached</span>
            <span className="font-mono text-xs font-bold text-white">
              {Object.values(snapshot?.tables || {}).reduce((acc, t) => acc + (t.count || 0), 0)} Total Records
            </span>
          </div>
        </motion.div>

      </StaggerGrid>

      {/* 3. TABLE SELECTION TABS & SEARCH */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Table Selector Tabs */}
        <div className="flex bg-[#0d1114] border border-white/10 p-1 rounded-xl overflow-x-auto w-full md:w-auto font-mono text-xs">
          {(['warehouses', 'inventory', 'orders', 'edges', 'users'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTable(tab);
                setExpandedRow(null);
              }}
              className={`px-4 py-2 rounded-lg font-bold capitalize transition shrink-0 ${
                activeTable === tab
                  ? 'bg-[#c8ff2e] text-[#06080a]'
                  : 'text-[#7f8a79] hover:text-white'
              }`}
            >
              {tab} ({snapshot?.tables?.[tab]?.count ?? 0})
            </button>
          ))}
        </div>

        {/* Search in active table */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7f8a79]" />
          <input
            type="text"
            placeholder={`Filter ${activeTable} rows...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-10 text-xs font-mono w-full"
          />
        </div>

      </div>

      {/* 4. DATA TABLE */}
      <div className="card-bento p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#06080a] border-b border-white/10 text-[10px] uppercase text-[#7f8a79] tracking-wider">
              <tr>
                <th className="w-8 py-4 pl-4 pr-1"></th>
                {tableKeys.map(k => (
                  <th key={k} className="py-4 px-5">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRows.map((row, idx) => {
                const isExpanded = expandedRow === idx;
                return (
                  <React.Fragment key={idx}>
                    <motion.tr
                      whileInView={{ opacity: 1, x: 0 }}
                      initial={{ opacity: 0, x: -8 }}
                      viewport={{ once: true, amount: 0.3 }}
                      onClick={() => setExpandedRow(isExpanded ? null : idx)}
                      className={`cursor-pointer transition select-none ${
                        isExpanded ? 'bg-[#c8ff2e]/10' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <td className="w-8 py-3.5 pl-4 pr-1 text-[#7f8a79]">
                        <motion.span
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="inline-block"
                        >
                          <ChevronRight size={13} className={isExpanded ? 'text-[#c8ff2e]' : 'text-[#7f8a79]'} />
                        </motion.span>
                      </td>
                      {tableKeys.map(k => {
                        const val = row[k];
                        const isKey = k.toLowerCase().includes('id') || k.toLowerCase().includes('code') || k.toLowerCase().includes('sku');
                        const isStatus = k.toLowerCase().includes('status');

                        return (
                          <td key={k} className="py-3.5 px-5">
                            {isKey ? (
                              <CopyCell value={String(val ?? '—')} />
                            ) : isStatus ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-white/10 bg-white/5 text-[#eef2e6]">
                                {String(val)}
                              </span>
                            ) : typeof val === 'object' && val !== null ? (
                              <span className="text-[#7f8a79]">{JSON.stringify(val)}</span>
                            ) : (
                              <span className="text-[#eef2e6]">{String(val ?? '—')}</span>
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>

                    {isExpanded && (
                      <tr className="bg-[#040608]/90 border-y border-[#c8ff2e]/30">
                        <td colSpan={tableKeys.length + 1} className="p-0">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="overflow-hidden p-4 sm:p-5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#c8ff2e] animate-pulse" />
                                <span className="font-mono text-xs font-bold text-[#eef2e6]">
                                  Row #{idx + 1} Record Payload
                                </span>
                                <span className="chip text-[10px] uppercase font-mono">{activeTable}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(JSON.stringify(row, null, 2));
                                }}
                                className="btn-volt sm text-[10px] font-mono flex items-center gap-1.5 self-start sm:self-auto"
                              >
                                <Copy size={11} /> Copy JSON
                              </button>
                            </div>
                            <pre className="font-mono text-[11px] text-[#c8ff2e]/80 bg-[#06080a] border border-white/5 rounded-xl p-3.5 overflow-x-auto leading-relaxed">
                              {JSON.stringify(row, null, 2)}
                            </pre>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {filteredRows.length === 0 && (
            <div className="text-center py-16 text-[#7f8a79] font-mono text-xs space-y-2">
              <Layers size={32} className="mx-auto text-[#7f8a79]/50" />
              <p>No rows found in table `{activeTable}` matching query.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
