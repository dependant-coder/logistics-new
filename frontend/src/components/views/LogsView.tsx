import { useLogistics } from '../../contexts/LogisticsContext';
import { Search, History, Radio } from 'lucide-react';
import { useState } from 'react';
import { ScannedTitle } from '../common/ScannedTitle';
import { TypewriterText } from '../common/TypewriterText';

function getSeverityClass(action: string): string {
  const lower = action.toLowerCase();
  if (/error|fail|critical|reject/.test(lower)) return 'severity-error';
  if (/success|complete|sync|confirmed|dispatched/.test(lower)) return 'severity-success';
  if (/warn|delay|slow|overdue/.test(lower)) return 'severity-warn';
  return 'severity-info';
}

export default function LogsView() {
  const { activityLogs } = useLogistics();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = activityLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="chip v">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff2e] animate-ping" />
              Real-Time Audit Trail
            </span>
            <span className="font-mono text-xs text-[#7f8a79]">
              ● Cryptographic Verification &amp; Timestamped Events
            </span>
          </div>

          <ScannedTitle>
            <h1 className="font-['Syne'] font-extrabold uppercase text-4xl sm:text-6xl tracking-tight leading-none">
              SYSTEM<br />
              <span className="text-[#c8ff2e]">AUDIT LOGS</span>
            </h1>
          </ScannedTitle>

          <p className="font-mono text-xs text-[#7f8a79] mt-3 max-w-xl">
            <TypewriterText text="IMMUTABLE AUDIT STREAM · CRYPTOGRAPHIC VERIFICATION · OPERATOR DISPATCHES" className="font-mono text-xs text-[#7f8a79]" />
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7f8a79]" size={16} />
          <input 
            type="text" 
            placeholder="Search audit trail..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-dark pl-10 text-xs font-mono w-full"
          />
        </div>
      </div>

      {/* 2. LOGS CONTAINER */}
      <div className="card-bento p-0 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-[#7f8a79] font-mono text-xs space-y-2">
            <History className="mx-auto h-10 w-10 text-[#7f8a79]/50" />
            <p>No activity logs found matching search criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 font-mono text-xs">
            {filteredLogs.map(log => (
              <div 
                key={log.id} 
                className={`p-4 hover:bg-white/[0.02] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${getSeverityClass(log.action)}`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <Radio size={14} className="text-[#c8ff2e] shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <span className="font-bold text-white text-sm block">{log.action}</span>
                    <span className="text-[#7f8a79] text-[10px] mt-0.5 block">Record ID: {log.id}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] text-[#7f8a79] bg-white/5 border border-white/10 shrink-0 self-start sm:self-auto">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
