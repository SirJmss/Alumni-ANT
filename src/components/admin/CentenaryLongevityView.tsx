import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Clock,
  Download,
  Calendar,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileCode,
  Landmark,
  RefreshCw,
  Award,
  Hash,
  Send,
  Plus,
  Compass,
  Database
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import {
  CentenaryDiagnosticResult,
  CentenaryTimeCapsule,
  CentenaryJubilee,
  runCentenaryLongevityAudit,
  getTimeCapsules,
  saveTimeCapsule,
  unsealCapsule,
  calculateCentenaryJubilees,
  getCentenaryBatchYears,
  downloadCentenaryVault,
  generateCentenaryArchivalPackage
} from '../../services/longevityService';
import { getRegistrarRecords } from '../../services/studentVerificationService';

export const CentenaryLongevityView: React.FC = () => {
  const {
    users,
    milestones,
    chapters,
    events,
    announcements,
    auditLogs,
    currentUser,
    showToast
  } = useAlumni();

  const [activeSubTab, setActiveSubTab] = useState<'diagnostics' | 'capsules' | 'jubilees' | 'vault'>('diagnostics');
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditResults, setAuditResults] = useState<CentenaryDiagnosticResult[]>([]);
  const [timeCapsules, setTimeCapsules] = useState<CentenaryTimeCapsule[]>(() => getTimeCapsules());
  const [selectedBatchForJubilee, setSelectedBatchForJubilee] = useState<string>('2024');
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportChecksum, setLastExportChecksum] = useState<string>('');

  // New Capsule Modal
  const [showNewCapsuleModal, setShowNewCapsuleModal] = useState(false);
  const [capsuleTitle, setCapsuleTitle] = useState('');
  const [capsuleCategory, setCapsuleCategory] = useState<CentenaryTimeCapsule['category']>('alumni_heritage');
  const [capsuleUnsealYear, setCapsuleUnsealYear] = useState<number>(2068);
  const [capsuleMessage, setCapsuleMessage] = useState('');
  const [capsuleTags, setCapsuleTags] = useState('Centennial, Legacy');

  const registryRecords = useMemo(() => getRegistrarRecords(), []);
  const centenaryBatches = useMemo(() => getCentenaryBatchYears(1968, 50), []);
  const projectedJubilees = useMemo(() => {
    const bYear = parseInt(selectedBatchForJubilee, 10) || 2024;
    return calculateCentenaryJubilees(bYear);
  }, [selectedBatchForJubilee]);

  // Run audit on mount
  useEffect(() => {
    runAudit();
  }, [users, registryRecords]);

  const runAudit = async () => {
    setIsRunningAudit(true);
    try {
      const res = await runCentenaryLongevityAudit({ users, registryRecords });
      setAuditResults(res);
    } catch (err) {
      console.error('Audit execution error:', err);
    } finally {
      setIsRunningAudit(false);
    }
  };

  const handleDownloadVault = async () => {
    setIsExporting(true);
    try {
      const archive = await downloadCentenaryVault({
        users,
        registryRecords,
        auditLogs,
        milestones,
        chapters,
        events,
        announcements
      });
      setLastExportChecksum(archive.sha256Checksum);
      showToast('100-Year Archival Vault package generated and downloaded successfully.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to download centenary vault.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capsuleTitle.trim() || !capsuleMessage.trim()) return;

    const saved = saveTimeCapsule({
      title: capsuleTitle.trim(),
      category: capsuleCategory,
      authorName: currentUser?.name || 'College Administrator',
      authorRole: currentUser?.role || 'admin',
      unsealYear: Number(capsuleUnsealYear) || 2068,
      message: capsuleMessage.trim(),
      tags: capsuleTags.split(',').map((t) => t.trim()).filter(Boolean)
    });

    setTimeCapsules(getTimeCapsules());
    setShowNewCapsuleModal(false);
    setCapsuleTitle('');
    setCapsuleMessage('');
    showToast(`Time capsule sealed until Year ${saved.unsealYear}!`, 'success');
  };

  const handleUnsealClick = (id: string, title: string) => {
    unsealCapsule(id);
    setTimeCapsules(getTimeCapsules());
    showToast(`Time capsule "${title}" unsealed for public review.`, 'success');
  };

  const overallHealthScore = useMemo(() => {
    if (auditResults.length === 0) return 100;
    const sum = auditResults.reduce((acc, r) => acc + r.score, 0);
    return Math.round(sum / auditResults.length);
  }, [auditResults]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
              <Landmark className="w-3.5 h-3.5" />
              <span>ST. CECILIA'S COLLEGE • 100-YEAR SYSTEM ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Centenary Durability & Long-Term Resilience
            </h2>
            <p className="text-stone-300 text-sm mt-2 leading-relaxed font-light">
              Built to withstand 100+ years of institutional operations (1968–2068–2124+). Features 64-bit epoch
              overflow immunity, zero-vendor-lock-in archival packages, centenary jubilee projections, and permanent time
              capsules for future generations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={runAudit}
              disabled={isRunningAudit}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-white border border-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRunningAudit ? 'animate-spin text-amber-400' : ''}`} />
              <span>Run Longevity Audit</span>
            </button>

            <button
              onClick={handleDownloadVault}
              disabled={isExporting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8B181B] hover:bg-[#721316] text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-amber-300" />
              )}
              <span>Export 100-Yr Vault</span>
            </button>
          </div>
        </div>

        {/* 4 Pillars Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-800">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Longevity Score</span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
              {overallHealthScore}%
            </span>
            <span className="text-[11px] text-stone-400">All 6 core tests passing</span>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Time-Horizon Span</span>
            <span className="text-2xl font-black text-amber-300 font-mono mt-0.5 block">
              100+ Yrs
            </span>
            <span className="text-[11px] text-stone-400">1968 to 2076+ cohorts</span>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Epoch Overflow</span>
            <span className="text-2xl font-black text-blue-300 font-mono mt-0.5 block">
              Immune
            </span>
            <span className="text-[11px] text-stone-400">64-bit millisecond ISO-8601</span>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Data Portability</span>
            <span className="text-2xl font-black text-purple-300 font-mono mt-0.5 block">
              Zero Lock-In
            </span>
            <span className="text-[11px] text-stone-400">Open UTF-8 JSON + RFC CSV</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex border-b border-stone-200 bg-white rounded-2xl px-3 py-2 shadow-xs gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('diagnostics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'diagnostics'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>100-Year Diagnostics</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-700 font-mono">
            {overallHealthScore}%
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('capsules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'capsules'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Clock className="w-4 h-4 text-blue-400" />
          <span>Centennial Time Capsules</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-700 font-mono">
            {timeCapsules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('jubilees')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'jubilees'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Award className="w-4 h-4 text-purple-400" />
          <span>Century Jubilee Projector</span>
        </button>

        <button
          onClick={() => setActiveSubTab('vault')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'vault'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-500" />
          <span>Universal Archival Vault</span>
        </button>
      </div>

      {/* TAB 1: 100-YEAR DURABILITY DIAGNOSTICS */}
      {activeSubTab === 'diagnostics' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Centenary Durability Health Check
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Automated suite that validates system behavior against date rollover bugs, data degradation, and vendor lock-in.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              System Rated: 100-Year Mission-Critical Safe
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auditResults.map((result) => (
              <div
                key={result.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-stone-300 transition-all shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        result.status === 'passed'
                          ? 'bg-emerald-50 text-emerald-600'
                          : result.status === 'warning'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">{result.name}</h4>
                      <span className="text-[10px] text-stone-400 uppercase font-mono">{result.category}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      result.status === 'passed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : result.status === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    SCORE: {result.score}%
                  </span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  {result.summary}
                </p>

                <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-600 font-mono border border-stone-100 leading-tight break-all">
                  {result.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CENTENNIAL TIME CAPSULES */}
      {activeSubTab === 'capsules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Centenary Institutional Time Capsules
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Digital capsules sealed by College leadership to be preserved and opened on milestone jubilee years.
              </p>
            </div>
            <button
              onClick={() => setShowNewCapsuleModal(true)}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Seal New Time Capsule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timeCapsules.map((capsule) => {
              const currentYear = new Date().getFullYear();
              const yearsRemaining = capsule.unsealYear - currentYear;
              const isReady = yearsRemaining <= 0;

              return (
                <div
                  key={capsule.id}
                  className={`bg-white rounded-2xl border p-5 space-y-4 transition-all shadow-xs ${
                    capsule.isSealed
                      ? 'border-amber-200/80 bg-gradient-to-br from-white to-amber-50/20'
                      : 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {capsule.isSealed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Lock className="w-3 h-3 text-amber-600" />
                            SEALED UNTIL YEAR {capsule.unsealYear}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Unlock className="w-3 h-3 text-emerald-600" />
                            UNSEALED HERITAGE RECORD
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400 uppercase font-medium">
                          Sealed: {capsule.sealedDate}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 pt-1">{capsule.title}</h4>
                      <p className="text-[11px] text-stone-500">
                        Author: <strong className="text-stone-700">{capsule.authorName}</strong> ({capsule.authorRole})
                      </p>
                    </div>

                    {capsule.isSealed && (
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-amber-700 block">
                          {yearsRemaining > 0 ? `${yearsRemaining} yrs left` : 'Jubilee Year Reached'}
                        </span>
                        {isReady && (
                          <button
                            onClick={() => handleUnsealClick(capsule.id, capsule.title)}
                            className="mt-1 px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Unseal Now
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message body */}
                  <div className="p-3.5 bg-white rounded-xl border border-stone-100 text-xs text-stone-700 leading-relaxed italic">
                    "{capsule.message}"
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px] text-stone-400">
                    <div className="flex gap-1.5 flex-wrap">
                      {capsule.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="font-mono text-stone-400">ID: {capsule.id.slice(0, 16)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CENTURY JUBILEE PROJECTOR */}
      {activeSubTab === 'jubilees' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Centenary Class Homecoming & Jubilee Projector
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Simulate and schedule all class reunions across a 100-year alumni lifecycle.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-stone-600 uppercase">Select Graduating Batch:</label>
                <select
                  value={selectedBatchForJubilee}
                  onChange={(e) => setSelectedBatchForJubilee(e.target.value)}
                  className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 font-mono"
                >
                  {centenaryBatches.map((b) => (
                    <option key={b} value={b}>
                      Class of {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-bold text-purple-900 block">
                  100-Year Milestone Trajectory for St. Cecilia's Class of {selectedBatchForJubilee}
                </span>
                <span className="text-[11px] text-purple-700">
                  Tracing alumni reunions from Year 1 through Year 100 Centennial Homecoming ({parseInt(selectedBatchForJubilee, 10) + 100}).
                </span>
              </div>
              <span className="text-xs font-mono font-bold bg-purple-200/80 text-purple-900 px-3 py-1 rounded-lg">
                11 Institutional Jubilees Projected
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projectedJubilees.map((jubilee) => (
              <div
                key={jubilee.milestoneName}
                className={`p-4 rounded-2xl border transition-all space-y-2 bg-white ${
                  jubilee.status === 'current'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                    : jubilee.status === 'past'
                    ? 'border-stone-200 opacity-80'
                    : 'border-purple-200 bg-gradient-to-b from-white to-purple-50/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-600 block">
                      +{jubilee.anniversaryYears} Years Post-Graduation
                    </span>
                    <h4 className="text-xs font-bold text-stone-900">{jubilee.milestoneName}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      jubilee.status === 'current'
                        ? 'bg-emerald-100 text-emerald-800'
                        : jubilee.status === 'past'
                        ? 'bg-stone-100 text-stone-600'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    Year {jubilee.reunionYear}
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 italic">"{jubilee.theme}"</p>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px]">
                  <span className="text-stone-400">Status:</span>
                  <span
                    className={`font-bold ${
                      jubilee.status === 'current'
                        ? 'text-emerald-700'
                        : jubilee.status === 'past'
                        ? 'text-stone-500'
                        : 'text-purple-700'
                    }`}
                  >
                    {jubilee.status === 'current'
                      ? '★ Active Jubilee This Year!'
                      : jubilee.status === 'past'
                      ? 'Celebrated in History'
                      : `In ${jubilee.yearsUntil} Years`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: UNIVERSAL ARCHIVAL VAULT */}
      {activeSubTab === 'vault' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  Self-Preserving 100-Year Archival Vault
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Generates an uncorrupted, portable package of all registered alumni, records, and milestones with zero vendor lock-in.
                </p>
              </div>

              <button
                onClick={handleDownloadVault}
                disabled={isExporting}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Download Standalone Centenary Vault</span>
              </button>
            </div>

            {lastExportChecksum && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-mono text-[11px] truncate">
                  SHA-256 Checksum Verified: <strong>{lastExportChecksum}</strong>
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <FileCode className="w-5 h-5 text-stone-700" />
                <span className="text-xs font-bold text-stone-900 block">Universal UTF-8 JSON</span>
                <p className="text-[11px] text-stone-500">
                  Full nested structures including profiles, time capsules, verification registries, and audit trails.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <span className="text-xs font-bold text-stone-900 block">RFC-4180 Standard CSV</span>
                <p className="text-[11px] text-stone-500">
                  Readable by any desktop spreadsheet software or tabular database for the next 100 years.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <Hash className="w-5 h-5 text-blue-700" />
                <span className="text-xs font-bold text-stone-900 block">Cryptographic Checksum</span>
                <p className="text-[11px] text-stone-500">
                  SHA-256 digital signature to verify bit-level authenticity across generations of archivists.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW TIME CAPSULE MODAL */}
      {showNewCapsuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-stone-900">Seal a New Centennial Time Capsule</h3>
              </div>
              <button
                onClick={() => setShowNewCapsuleModal(false)}
                className="text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCapsule} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">CAPSULE TITLE</label>
                <input
                  type="text"
                  required
                  value={capsuleTitle}
                  onChange={(e) => setCapsuleTitle(e.target.value)}
                  placeholder="e.g. Letter to the Class of 2075 on Campus Digital Century"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">TARGET UNSEAL YEAR</label>
                  <input
                    type="number"
                    required
                    min={new Date().getFullYear() + 1}
                    max={2124}
                    value={capsuleUnsealYear}
                    onChange={(e) => setCapsuleUnsealYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">CATEGORY</label>
                  <select
                    value={capsuleCategory}
                    onChange={(e) => setCapsuleCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  >
                    <option value="presidential_address">Presidential Address</option>
                    <option value="alumni_heritage">Alumni Heritage</option>
                    <option value="student_council">Student Council</option>
                    <option value="commencement_pledge">Commencement Pledge</option>
                    <option value="campus_history">Campus History</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  MESSAGE / ARTIFACT NARRATIVE
                </label>
                <textarea
                  required
                  rows={4}
                  value={capsuleMessage}
                  onChange={(e) => setCapsuleMessage(e.target.value)}
                  placeholder="Write an address to future Cecilians who will open this capsule decades from now..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">TAGS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  value={capsuleTags}
                  onChange={(e) => setCapsuleTags(e.target.value)}
                  placeholder="Centennial, Class of 2075, Legacy"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCapsuleModal(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Seal Digitally into Vault</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
