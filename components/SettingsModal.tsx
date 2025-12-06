
import React, { useState } from 'react';
import { X, Settings, Volume2, VolumeX, Eye, EyeOff, RotateCcw, Lock, CloudFog, Download, FileText, Copy, Check, MessageSquare } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  isSfxEnabled: boolean;
  onToggleSfx: (enabled: boolean) => void;
  isFogEnabled: boolean;
  onToggleFog: () => void;
  isFogTimeReached: boolean;
  onResetGame: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  isSfxEnabled,
  onToggleSfx,
  isFogEnabled,
  onToggleFog,
  isFogTimeReached,
  onResetGame
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const generateReportString = (): string | null => {
    try {
        const STORAGE_KEY = 'yongchun_save_v1';
        const savedRaw = localStorage.getItem(STORAGE_KEY);
        
        if (!savedRaw) {
            alert("尚無存檔紀錄，無法匯出。");
            return null;
        }

        const data = JSON.parse(savedRaw);
        const { teamName, playerStats, startTime, endTime, puzzleProgress } = data;
        
        // Helper to format date
        const fmtDate = (isoStr: string) => isoStr ? new Date(isoStr).toLocaleString('zh-TW') : '未完成';
        
        // Construct Report
        let report = `=== 永春陂地質調查報告 ===\n`;
        report += `匯出時間: ${new Date().toLocaleString('zh-TW')}\n`;
        report += `------------------------\n`;
        report += `隊伍名稱: ${teamName || 'Unknown'}\n`;
        report += `目前階級: ${playerStats?.rank} (Lv.${playerStats?.level})\n`;
        report += `開始時間: ${fmtDate(startTime)}\n`;
        report += `結束時間: ${fmtDate(endTime)}\n`;
        report += `------------------------\n\n`;

        // Mission 1
        const m1 = puzzleProgress?.['1'];
        if (m1) {
            report += `【任務一：四獸山連線】\n`;
            report += `狀態: ${m1.isQuizSolved ? '已完成' : '進行中'}\n`;
            if (m1.m1Heights) {
                report += `[高度測量]\n`;
                report += `  - 虎山: ${m1.m1Heights.tiger || '-'} m\n`;
                report += `  - 豹山: ${m1.m1Heights.leopard || '-'} m\n`;
                report += `  - 獅山: ${m1.m1Heights.lion || '-'} m\n`;
                report += `  - 象山: ${m1.m1Heights.elephant || '-'} m\n`;
            }
            report += `[地形觀察]: ${m1.m1Reason || '未填寫'}\n\n`;
        } else {
             report += `【任務一】：尚未開始\n\n`;
        }

        // Mission 2
        const m2 = puzzleProgress?.['2'];
        if (m2) {
            report += `【任務二：岩層解密】\n`;
            report += `[地層問答]: ${m2.quizInput || '未作答'}\n`;
            report += `[採樣筆記]: ${m2.imageDescription || '未填寫'}\n\n`;
        } else {
             report += `【任務二】：尚未開始\n\n`;
        }

        // Mission 3
        const m3 = puzzleProgress?.['3'];
        if (m3) {
            report += `【任務三：等高線挑戰】\n`;
            report += `[等高線判讀]: 等高線越「${m3.quizSelect1 || '-'}」，爬起來越「${m3.quizSelect2 || '-'}」，坡度感受「${m3.quizSelect3 || '-'}」\n`;
            report += `[路線繪製筆記]: ${m3.imageDescription || '未填寫'}\n\n`;
        } else {
             report += `【任務三】：尚未開始\n\n`;
        }

        // Side Missions
        const s1 = puzzleProgress?.['s1'];
        if (s1 && s1.sideMissionSubmissions && s1.sideMissionSubmissions.length > 0) {
            report += `【支線任務：擋土牆獵人】(共 ${s1.sideMissionSubmissions.length} 筆紀錄)\n`;
            s1.sideMissionSubmissions.forEach((sub: any, idx: number) => {
                report += `  #${idx + 1} [${new Date(sub.timestamp).toLocaleTimeString()}]: ${sub.description || '無文字說明'}\n`;
            });
            report += `\n`;
        } else {
             report += `【支線任務】：無紀錄\n\n`;
        }
        
        return report;
    } catch (e) {
        console.error("Report Generation failed:", e);
        return null;
    }
  };

  const handleDownload = () => {
    const report = generateReportString();
    if (!report) return;
    
    try {
        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const STORAGE_KEY = 'yongchun_save_v1';
        const savedRaw = localStorage.getItem(STORAGE_KEY);
        const data = savedRaw ? JSON.parse(savedRaw) : {};
        
        link.href = url;
        link.download = `yongchun_report_${data.teamName || 'data'}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error("Download failed:", e);
        alert("下載失敗。");
    }
  };

  const handleCopy = async () => {
    const report = generateReportString();
    if (!report) return;

    try {
        await navigator.clipboard.writeText(report);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        alert("複製失敗，請手動下載。");
    }
  };

  return (
    <div className="absolute inset-0 z-[1400] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl relative flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold font-mono text-slate-700 flex items-center gap-2">
                <Settings className="w-5 h-5" /> 系統設定 (SYSTEM CONFIG)
            </h2>
            <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-900"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6 space-y-6">
            
            {/* Audio Section */}
            <div>
                <h3 className="text-xs font-mono font-bold text-slate-500 uppercase mb-3">Audio Protocol</h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isSfxEnabled ? 'bg-teal-100 text-teal-600' : 'bg-slate-200 text-slate-400'}`}>
                            {isSfxEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="font-bold text-slate-700 text-sm">音效系統 (SFX)</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                                {isSfxEnabled ? 'SYSTEM ONLINE' : 'MUTED'}
                            </div>
                        </div>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button 
                        onClick={() => onToggleSfx(!isSfxEnabled)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isSfxEnabled ? 'bg-teal-500' : 'bg-slate-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isSfxEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
            </div>

            {/* Visual Section */}
            <div>
                <h3 className="text-xs font-mono font-bold text-slate-500 uppercase mb-3">Visual Obfuscation</h3>
                <div className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    !isFogTimeReached ? 'bg-slate-100 border-slate-200 opacity-75' : 'bg-slate-50 border-slate-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${!isFogTimeReached ? 'bg-slate-200 text-slate-400' : isFogEnabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                            {!isFogTimeReached ? <Lock className="w-5 h-5" /> : (isFogEnabled ? <CloudFog className="w-5 h-5" /> : <Eye className="w-5 h-5" />)}
                        </div>
                        <div>
                            <div className="font-bold text-slate-700 text-sm">迷霧模式 (Mysterious mist)</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                                {!isFogTimeReached ? 'LOCKED (WAIT T+01:00)' : isFogEnabled ? 'ACTIVE' : 'DISABLED'}
                            </div>
                        </div>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button 
                        onClick={onToggleFog}
                        disabled={!isFogTimeReached}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                            !isFogTimeReached ? 'bg-slate-200 cursor-not-allowed' :
                            isFogEnabled ? 'bg-indigo-500' : 'bg-slate-300'
                        }`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                            isFogEnabled && isFogTimeReached ? 'translate-x-6' : 'translate-x-0'
                        }`}></div>
                    </button>
                </div>
                {!isFogTimeReached && (
                    <p className="text-[10px] text-amber-600 mt-2 font-mono flex items-center gap-1">
                        <Lock className="w-3 h-3" /> 功能鎖定中：請於任務開始 1 分鐘後再嘗試。
                    </p>
                )}
            </div>

            {/* Data Management Section */}
            <div>
                <h3 className="text-xs font-mono font-bold text-slate-500 uppercase mb-3">Data Management</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={handleDownload}
                        className="bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 hover:border-teal-300 py-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        下載 (TXT)
                    </button>
                    <button 
                        onClick={handleCopy}
                        className={`border py-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                            copySuccess 
                            ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600' 
                            : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-300'
                        }`}
                    >
                        {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copySuccess ? '已複製！' : '複製文字'}
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono ml-1">
                    * 下載或複製調查報告，便於分享至群組及回饋單。
                </p>
            </div>

            {/* Feedback Section */}
            <div>
                <h3 className="text-xs font-mono font-bold text-slate-500 uppercase mb-3">Feedback Channel</h3>
                <a 
                    href="https://forms.gle/9AARkdi4Hh8cyaJ2A" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-300 py-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm group"
                >
                    <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    填寫回饋表單 (OPEN SURVEY)
                </a>
                <p className="text-[10px] text-slate-400 mt-2 font-mono ml-1">
                    * 您的意見能幫助我們改進調查系統。
                </p>
            </div>

        </div>

        {/* Footer / Danger Zone */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
            <h3 className="text-[10px] font-mono font-bold text-rose-400 uppercase mb-2">Danger Zone</h3>
            <button 
                onClick={onResetGame}
                className="w-full bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 py-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
                <RotateCcw className="w-4 h-4" />
                SYSTEM RESET (DELETE SAVE)
            </button>
        </div>

      </div>
    </div>
  );
};
