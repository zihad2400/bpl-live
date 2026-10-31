"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Target, Hand, ShieldAlert, Zap, ShieldOff, Hammer, X, AlertTriangle, Pencil, Trophy, ShieldQuestion, UserPlus, Info, Settings, Star, ArrowLeft, Play, CheckCircle, Clock } from "lucide-react";

export default function ScorerPage() {
  const { user, loading } = useAuth();

  const [matches, setMatches] = useState([]);
  const [matchId, setMatchId] = useState("");
  const [match, setMatch] = useState(null);
  const [innings, setInnings] = useState(null);
  const [inningsList, setInningsList] = useState([]);
  const [currentOverDeliveries, setCurrentOverDeliveries] = useState([]);
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState("list"); 

  const [showStartModal, setShowStartModal] = useState(false);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showBatterModal, setShowBatterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditStatsModal, setShowEditStatsModal] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "error" });
  const [batterError, setBatterError] = useState("");
  const [bowlerError, setBowlerError] = useState("");

  const [editTarget, setEditTarget] = useState({ role: "", oldName: "" });
  const [editNewName, setEditNewName] = useState("");
  const [selStriker, setSelStriker] = useState("");
  const [selNonStriker, setSelNonStriker] = useState("");
  const [selBowler, setSelBowler] = useState("");
  const [wicketType, setWicketType] = useState("bowled");
  const [dismissedBatter, setDismissedBatter] = useState("striker");
  const [replaceRole, setReplaceRole] = useState("striker");
  const [newBatterName, setNewBatterName] = useState("");

  const [editRuns, setEditRuns] = useState(0);
  const [editWickets, setEditWickets] = useState(0);
  const [editBalls, setEditBalls] = useState(0);
  const [editMatchOvers, setEditMatchOvers] = useState(20);
  const [editTargetVal, setEditTargetVal] = useState(0);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "error" }), 3000);
  };

  const load = async () => {
    if (!matchId) return;
    const res = await fetch(`/api/matches/${matchId}?t=${Date.now()}`, { cache: 'no-store' });
    const d = await res.json();
    // ⚡ Safety Check: ম্যাচে টিম আছে কিনা নিশ্চিত করা
    if (d.match && d.match.teamA && d.match.teamB) {
      setMatch(d.match);
      setInningsList(d.innings || []);
      fetch(`/api/players?teamId=${d.match.teamA._id}`).then(r => r.json()).then(x => setTeamAPlayers(x.players || []));
      fetch(`/api/players?teamId=${d.match.teamB._id}`).then(r => r.json()).then(x => setTeamBPlayers(x.players || []));
    } else {
      setMatch(null);
      setInningsList([]);
      setInnings(null);
    }
    const current = d.innings?.[d.innings.length - 1] || null;
    setInnings(current);
    setCurrentOverDeliveries(d.currentOverDeliveries || []);
  };

  useEffect(() => {
    if (user) {
      fetch("/api/matches").then((r) => r.json()).then((d) => {
        const fetchedMatches = d.matches || [];
        setMatches(fetchedMatches);
      }).finally(() => setDataLoading(false));
    }
  }, [user]);

  useEffect(() => { 
    if (user && matchId && viewMode === "scoring") load(); 
  }, [matchId, user, viewMode]);

  useEffect(() => { if (showBatterModal) setBatterError(""); }, [showBatterModal]);
  useEffect(() => { if (showBowlerModal) setBowlerError(""); }, [showBowlerModal]);

  const handleSelectMatch = (id) => {
    setMatchId(id);
    setViewMode("scoring");
  };

  // ⚡ এই ফাংশনটি যুক্ত করা হলো
  const handleMatchChange = (e) => {
    setMatchId(e.target.value);
  };

  const openEditStats = () => {
    if (!innings || !match) return;
    setEditRuns(innings.totalRuns);
    setEditWickets(innings.wickets);
    setEditBalls(innings.totalLegalBalls);
    setEditMatchOvers(match.overs || 20);
    setEditTargetVal(innings.target || 0);
    setShowEditStatsModal(true);
  };

  const handleSaveStats = async () => {
    setActionLoading(true);
    const res = await fetch(`/api/matches/${matchId}/edit-stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inningsId: innings._id, totalRuns: Number(editRuns), totalWickets: Number(editWickets),
        totalBalls: Number(editBalls), matchOvers: Number(editMatchOvers), newTarget: Number(editTargetVal)
      }),
    });
    if (res.ok) { showToast("Stats updated & Match Resumed!", "success"); setShowEditStatsModal(false); window.location.reload(); }
    else { showToast("Failed to update stats"); setActionLoading(false); }
  };

  const strikerObj = innings?.batters?.find(b => b.name === innings.striker);
  const nonStrikerObj = innings?.batters?.find(b => b.name === innings.nonStriker);
  const strikerOut = strikerObj?.out;
  const nonStrikerOut = nonStrikerObj?.out;
  const needsNewBatter = strikerOut || nonStrikerOut;

  const maxOvers = Number(match?.overs) || 20;
  const maxBalls = maxOvers * 6;
  const target = innings?.target;
  const runsNeeded = (target && innings?.inningsNumber === 2) ? target - innings.totalRuns : null;
  const ballsLeft = (target && innings?.inningsNumber === 2) ? maxBalls - (innings?.totalLegalBalls || 0) : null;
  
  const isFirstInningsOver = inningsList.length === 1 && (innings?.totalLegalBalls >= maxBalls || innings?.wickets >= 10);
  const isSecondInningsOver = inningsList.length === 2 && ((innings?.totalLegalBalls >= maxBalls) || (innings?.wickets >= 10) || (runsNeeded !== null && runsNeeded <= 0));
  
  const isMatchOver = isSecondInningsOver || match?.status === "completed";

  useEffect(() => {
    if (needsNewBatter && !showBatterModal && !isMatchOver) {
      setReplaceRole(strikerOut ? "striker" : "nonStriker");
      setShowBatterModal(true);
    }
  }, [needsNewBatter, strikerOut, isMatchOver, showBatterModal]);

  const startInnings = async () => {
    if (!selStriker || !selNonStriker || !selBowler) return showToast("Select all players!");
    setActionLoading(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/innings`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ striker: selStriker, nonStriker: selNonStriker, bowler: selBowler }),
      });
      if (!res.ok) throw new Error("Failed");
      setShowStartModal(false); setSelStriker(""); setSelNonStriker(""); setSelBowler("");
      await load(); showToast("Innings started!", "success");
    } catch (err) { showToast("Error starting innings"); } finally { setActionLoading(false); }
  };

  const deliver = async (payload) => {
    if (!innings) return;
    if (!innings.bowler) return showToast("Select a bowler!");
    if (needsNewBatter) return showToast("Select a new batter!");
    
    setActionLoading(true);
    const res = await fetch(`/api/matches/${matchId}/delivery`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inningsId: innings._id, delivery: payload }),
    });

    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || "Cannot record.");
      setActionLoading(false);
      return;
    }

    const data = await res.json();
    await load(); setActionLoading(false);
    if (data.innings.bowler === null) setShowBowlerModal(true);
  };

  const confirmWicket = () => {
    deliver({ runs: 0, extraType: null, isWicket: true, wicketType, dismissedBatter });
    setShowWicketModal(false);
  };

  const handleSetNewBatter = async () => {
    if (!newBatterName) { setBatterError("You must select a batter."); return; }
    setBatterError(""); setActionLoading(true);
    const res = await fetch(`/api/matches/${matchId}/set-batter`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inningsId: innings._id, role: replaceRole, newBatterName }),
    });
    if (res.ok) { setShowBatterModal(false); setNewBatterName(""); await load(); showToast("Batter added!", "success"); }
    else { const err = await res.json(); setBatterError(err.error || "Failed"); }
    setActionLoading(false);
  };

  const handleSetBowler = async () => {
    if (!selBowler) { setBowlerError("You must select a bowler."); return; }
    setBowlerError(""); setActionLoading(true);
    const res = await fetch(`/api/matches/${matchId}/set-bowler`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inningsId: innings._id, bowler: selBowler }),
    });
    if (res.ok) { setShowBowlerModal(false); setSelBowler(""); await load(); showToast("Bowler set!", "success"); }
    else { const err = await res.json(); setBowlerError(err.error || "Failed"); }
    setActionLoading(false);
  };

  const handleEditPlayer = async () => {
    if (!editNewName || editNewName === editTarget.oldName) { setShowEditModal(false); return; }
    setActionLoading(true);
    await fetch(`/api/matches/${matchId}/edit-player`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inningsId: innings._id, role: editTarget.role, oldName: editTarget.oldName, newName: editNewName }),
    });
    setShowEditModal(false); await load(); setActionLoading(false);
  };

  const openEditModal = (role, oldName) => { setEditTarget({ role, oldName }); setEditNewName(oldName); setShowEditModal(true); };

  const curStriker = innings?.batters?.find(b => b.name === innings.striker);
  const curNonStriker = innings?.batters?.find(b => b.name === innings.nonStriker);
  const curBowler = innings?.bowlers?.find(b => b.name === innings.bowler);

  const WICKET_TYPES = [
    { id: "bowled", label: "Bowled", icon: Target },
    { id: "caught", label: "Caught", icon: Hand },
    { id: "lbw", label: "LBW", icon: ShieldAlert },
    { id: "runout", label: "Run Out", icon: Zap },
    { id: "stumped", label: "Stumped", icon: ShieldOff },
    { id: "hitwicket", label: "Hit Wicket", icon: Hammer },
  ];

  const availableBatters = (innings?.inningsNumber === 1 ? teamAPlayers : teamBPlayers).filter(
    p => !innings?.batters?.some(b => b.name === p.name)
  );

  const modalBowlingPlayers = isFirstInningsOver ? teamBPlayers : teamAPlayers;
  
  let maxBowlerOvers = 4;
  if (maxOvers === 20) maxBowlerOvers = 6;
  else if (maxOvers === 15) maxBowlerOvers = 4;
  else if (maxOvers === 10) maxBowlerOvers = 3;
  else maxBowlerOvers = Math.ceil(maxOvers / 5);

  let lastBowlerName = null;
  if (currentOverDeliveries && currentOverDeliveries.length > 0) {
    lastBowlerName = currentOverDeliveries[currentOverDeliveries.length - 1].bowler;
  }

  const allowedBowlers = modalBowlingPlayers.filter(p => {
    if (p.name === lastBowlerName) return false;
    const bStat = innings?.bowlers?.find(b => b.name === p.name);
    if (bStat && (bStat.legalBalls / 6) >= maxBowlerOvers) return false;
    return true;
  });

  const modalBattingPlayers = isFirstInningsOver ? teamBPlayers : teamAPlayers;
  const displayOverNum = (innings?.totalLegalBalls % 6 === 0 && innings?.totalLegalBalls > 0) 
    ? innings.totalLegalBalls / 6 
    : Math.floor((innings?.totalLegalBalls || 0) / 6) + 1;

  if (loading || dataLoading) return <div className="p-20 text-center animate-pulse text-[#8892b0]">Loading Dashboard...</div>;
  
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-crimson" />
        <h1 className="text-4xl font-black text-white">Access Denied</h1>
        <Link href="/" className="btn-grad bg-gradient-to-r from-electric to-royal mt-4 px-8">Back to Home</Link>
      </div>
    );
  }

  // ⚡ MATCH LIST VIEW (Default)
  if (viewMode === "list") {
    return (
      <div className="space-y-8 animate-slide-up max-w-6xl mx-auto pb-20">
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-neon to-cyan-400">Scorer Dashboard</h1>
          <p className="text-[#8892b0]">Select a match to start scoring or view live results.</p>
        </div>

        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
            <ShieldQuestion className="w-16 h-16 text-white/20" />
            <h3 className="text-2xl font-bold text-white">No Matches Found</h3>
            <Link href="/admin" className="btn-grad bg-gradient-to-r from-emerald-neon to-cyan-400 text-black px-6 py-2">Go to Admin Panel</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {matches.map(m => {
              const isLive = m.status === "live";
              const isCompleted = m.status === "completed";
              return (
                <div key={m._id} 
                  onClick={() => handleSelectMatch(m._id)}
                  className={`panel relative overflow-hidden p-6 cursor-pointer hover:-translate-y-1 transition-all duration-300 border ${
                    isLive ? 'border-crimson/40 hover:shadow-[0_0_30px_rgba(225,29,72,0.2)] bg-gradient-to-br from-crimson/10 to-transparent' : 
                    isCompleted ? 'border-emerald-neon/20 hover:shadow-[0_0_30px_rgba(16,255,159,0.1)] bg-gradient-to-br from-emerald-neon/5 to-transparent' : 
                    'border-white/10 hover:border-electric/50 bg-gradient-to-br from-white/5 to-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      isLive ? 'bg-crimson/20 text-crimson' : isCompleted ? 'bg-emerald-neon/20 text-emerald-neon' : 'bg-white/10 text-white/50'
                    }`}>
                      {isLive ? <Play className="w-3 h-3" /> : isCompleted ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {m.status}
                    </span>
                    <span className="text-xs text-white/40">Match #{m.matchNo || '?'}</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-lg">{m.teamA?.name || "Team A"}</span>
                      <span className="text-sm text-white/50">{m.teamA?.shortName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-lg">{m.teamB?.name || "Team B"}</span>
                      <span className="text-sm text-white/50">{m.teamB?.shortName}</span>
                    </div>
                  </div>

                  {isCompleted && m.result ? (
                    <div className="text-emerald-neon text-sm font-bold truncate mt-4 pt-4 border-t border-white/10">{m.result}</div>
                  ) : (
                    <div className="text-[#8892b0] text-xs truncate mt-4 pt-4 border-t border-white/10">{m.venue}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ⚡ SCORING VIEW (When a match is selected)
  return (
    <div className="space-y-6 pb-20 relative animate-slide-up">
      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md border ${toast.type === "error" ? "bg-[#1a1515]/90 border-crimson/50 text-white" : "bg-[#0f1530]/90 border-emerald-neon/50 text-white"}`}>
            {toast.type === "error" ? <AlertTriangle className="w-5 h-5 text-crimson" /> : <Info className="w-5 h-5 text-emerald-neon" />}
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <button onClick={() => setViewMode("list")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:text-emerald-neon transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-black truncate max-w-md">
            {match?.teamA?.shortName} vs {match?.teamB?.shortName}
          </h1>
          {innings && (
            <button onClick={openEditStats} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:text-emerald-neon transition">
              <Settings className="w-3.5 h-3.5" /> Edit Stats
            </button>
          )}
        </div>
        
        <select value={matchId} onChange={handleMatchChange} className="bg-[#0f1530] border border-[#1e2749] rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-neon max-w-xs truncate w-full md:w-auto">
          {matches.map((m) => (
            <option key={m._id} value={m._id}>
              Match #{m.matchNo || '?'} - {m.teamA?.shortName} vs {m.teamB?.shortName} ({m.status.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {isMatchOver ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] relative overflow-hidden animate-slide-up w-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-neon/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-magenta/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-3xl w-full px-4">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-neon rounded-full blur-2xl opacity-40 animate-pulse" />
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1a2341] to-[#0a0e27] flex items-center justify-center border-2 border-emerald-neon shadow-[0_0_40px_rgba(16,255,159,0.4)] relative z-10">
                <Trophy className="w-14 h-14 text-emerald-neon drop-shadow-[0_0_15px_rgba(16,255,159,0.8)]" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-neon via-cyan-400 to-royal pb-2">
                Match Completed!
              </h1>
              <div className="inline-block bg-white/5 border border-white/10 px-8 py-4 rounded-2xl shadow-xl backdrop-blur-md">
                <p className="text-2xl md:text-3xl font-black text-white tracking-wide">
                  {match.result || "Match Ended"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-6">
              <div className="panel p-6 bg-gradient-to-b from-gold/10 to-transparent border-gold/30 flex flex-col items-center justify-center">
                <Star className="w-8 h-8 text-gold mb-2 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                <div className="text-[10px] text-gold font-black uppercase tracking-widest mb-1">Man of the Match</div>
                <div className="text-xl font-black text-white text-center">{match.manOfTheMatch || "N/A"}</div>
              </div>
              <div className="panel p-6 bg-white/5 border-white/10 flex flex-col items-center justify-center">
                <div className="text-[10px] text-[#8892b0] font-black uppercase tracking-widest mb-1">Top Batter</div>
                <div className="text-lg font-bold text-gold text-center">{match.topBatter || "N/A"}</div>
              </div>
              <div className="panel p-6 bg-white/5 border-white/10 flex flex-col items-center justify-center">
                <div className="text-[10px] text-[#8892b0] font-black uppercase tracking-widest mb-1">Top Bowler</div>
                <div className="text-lg font-bold text-electric text-center">{match.topBowler || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {inningsList.length === 0 && match && (
            <div className="panel p-8 text-center bg-grad-live">
              <p className="mb-4 text-white/70">Innings has not started yet. Match format: {maxOvers} Overs.</p>
              <button onClick={() => setShowStartModal(true)} className="btn-grad bg-gradient-to-r from-emerald-neon to-cyan-400 text-black px-8 py-3 text-lg">Start 1st Innings</button>
            </div>
          )}

          {innings && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                {innings.inningsNumber === 2 && runsNeeded > 0 && (
                  <div className="panel p-4 bg-gradient-to-r from-royal/40 to-magenta/40 border border-magenta/50 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Trophy className="w-5 h-5 text-gold" /> {match.teamB?.name} need <span className="text-gold text-xl">{runsNeeded}</span> runs from <span className="text-gold text-xl">{ballsLeft}</span> balls
                    </div>
                    <div className="text-sm text-white/70">Target: {target}</div>
                  </div>
                )}

                <div className="panel p-6 bg-grad-live relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                      <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Batting</div>
                      <div className="text-5xl font-black mt-1">{innings.totalRuns}<span className="text-3xl text-white/60">/{innings.wickets}</span></div>
                      <div className="text-emerald-neon font-bold mt-1">Overs: {Math.floor(innings.totalLegalBalls / 6)}.{innings.totalLegalBalls % 6} / {maxOvers}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Run Rate</div>
                      <div className="text-2xl font-black text-cyan-400">{innings.totalLegalBalls ? (innings.totalRuns / (innings.totalLegalBalls / 6)).toFixed(2) : "0.00"}</div>
                    </div>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <div className="flex justify-between text-xs text-white/50 font-bold border-b border-white/10 pb-2">
                      <span>Batter</span>
                      <div className="flex gap-6"><span>R</span><span>B</span><span>4s</span><span>6s</span><span>SR</span></div>
                    </div>
                    {[curStriker, curNonStriker].map((b, i) => b && (
                      <div key={i} className={`flex justify-between items-center text-sm py-1 group ${b.out ? 'opacity-50 line-through' : ''}`}>
                        <span className="font-bold flex items-center gap-2">
                          {b.name} {!b.out && i === 0 ? "🏏" : ""}
                          {b.out && <span className="text-[10px] text-crimson font-bold bg-crimson/10 px-2 py-0.5 rounded no-underline">OUT</span>}
                        </span>
                        <div className="flex gap-6 font-mono text-white/80">
                          <span className="font-black text-gold">{b.runs}</span>
                          <span>{b.balls}</span>
                          <span>{b.fours}</span>
                          <span>{b.sixes}</span>
                          <span>{b.balls ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel relative overflow-hidden p-5 border border-electric/30">
                  <div className="absolute inset-0 bg-grad-bowling opacity-20" />
                  <div className="absolute inset-0 bg-[#0a0e27]/60" />
                  <div className="relative z-10">
                    <div className="text-xs text-electric uppercase tracking-widest font-bold mb-2">Current Bowler</div>
                    {curBowler ? (
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-lg text-white flex items-center gap-2">
                          {curBowler.name}
                          <button onClick={() => openEditModal("bowler", curBowler.name)} className="text-white/30 hover:text-emerald-neon transition">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex gap-4 font-mono text-sm">
                          <div className="text-center"><div className="text-white/50 text-xs">O</div><div className="font-bold">{Math.floor(curBowler.legalBalls / 6)}.{curBowler.legalBalls % 6}</div></div>
                          <div className="text-center"><div className="text-white/50 text-xs">R</div><div className="font-bold text-crimson">{curBowler.runs}</div></div>
                          <div className="text-center"><div className="text-white/50 text-xs">W</div><div className="font-bold text-emerald-neon">{curBowler.wickets}</div></div>
                          <div className="text-center"><div className="text-white/50 text-xs">ECO</div><div className="font-bold text-gold">{curBowler.legalBalls ? (curBowler.runs / (curBowler.legalBalls / 6)).toFixed(2) : "0.00"}</div></div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-crimson font-bold flex items-center gap-2 animate-pulse">
                        <AlertTriangle className="w-4 h-4" /> Select a bowler to start the over!
                      </div>
                    )}
                  </div>
                </div>

                <div className="panel p-5">
                  <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">Current Over</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white/40 w-8 whitespace-nowrap">Ov {displayOverNum}</span>
                      <div className="flex gap-1.5 flex-wrap flex-1">
                        {currentOverDeliveries?.map((d, i) => (
                          <span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border border-white/10 ${
                            d.isWicket ? "bg-crimson text-white" : d.runs === 6 ? "bg-magenta text-white" : d.runs === 4 ? "bg-gold text-black" : d.extraType ? "bg-electric text-black" : "bg-white/5 text-white"
                          }`}>
                            {d.isWicket ? "W" : d.extraType === "wide" ? "wd" : d.extraType === "noball" ? "nb" : d.runs}
                          </span>
                        ))}
                        {(!currentOverDeliveries || currentOverDeliveries.length === 0) && <div className="text-xs text-white/40">No balls bowled yet.</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`panel p-6 space-y-4 h-fit sticky top-24 transition-all ${(!innings.bowler || needsNewBatter) && !isMatchOver ? 'border-crimson/50 shadow-[0_0_20px_rgba(225,29,72,0.2)]' : ''}`}>
                <h3 className="font-bold text-emerald-neon uppercase tracking-wider text-sm flex justify-between items-center">
                  Record Delivery
                  {(!innings.bowler || needsNewBatter) && !isMatchOver && <span className="text-crimson text-xs animate-pulse bg-crimson/10 px-2 py-1 rounded">LOCKED</span>}
                </h3>

                {isFirstInningsOver ? (
                  <div className="flex flex-col items-center justify-center py-6 px-2 space-y-3 bg-emerald-neon/10 rounded-2xl border border-emerald-neon/30">
                    <Trophy className="w-10 h-10 text-emerald-neon" />
                    <p className="text-white font-bold text-center">1st Innings Complete!</p>
                    <p className="text-white/60 text-sm text-center">Target for {match.teamB?.name}: {innings.totalRuns + 1} runs</p>
                    <button onClick={() => setShowStartModal(true)} className="btn-grad bg-gradient-to-r from-emerald-neon to-cyan-400 text-black w-[85%] py-2.5 text-sm mt-2 font-bold shadow-glow">Start 2nd Innings</button>
                  </div>
                ) : !innings.bowler ? (
                  <div className="flex flex-col items-center justify-center py-6 px-2 space-y-3 bg-white/5 rounded-2xl border border-white/10">
                    <ShieldQuestion className="w-10 h-10 text-white/20" />
                    <p className="text-white/60 text-sm text-center">You must select a bowler for the new over.</p>
                    <button onClick={() => setShowBowlerModal(true)} className="btn-grad bg-gradient-to-r from-electric to-royal w-[85%] py-2.5 text-sm mt-2">Select Bowler</button>
                  </div>
                ) : needsNewBatter ? (
                  <div className="flex flex-col items-center justify-center py-6 px-2 space-y-3 bg-crimson/10 rounded-2xl border border-crimson/30">
                    <UserPlus className="w-10 h-10 text-crimson" />
                    <p className="text-white font-bold text-center">Batter is OUT!</p>
                    <p className="text-white/60 text-sm text-center">You must select a new batter to continue.</p>
                    <button onClick={() => setShowBatterModal(true)} className="btn-grad bg-gradient-to-r from-crimson to-red-700 w-[85%] py-2.5 text-sm mt-2">Select New Batter</button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2, 3, 4, 6].map((r) => (
                        <button key={r} onClick={() => deliver({ runs: r, extraType: null })} disabled={actionLoading} className="ball !w-full !h-14 !rounded-xl bg-white/5 hover:bg-gradient-to-br hover:from-emerald-neon hover:to-cyan-400 hover:text-black transition text-xl">
                          {r}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => deliver({ runs: 0, extraType: "wide", extraRuns: 1 })} className="btn-grad bg-gradient-to-r from-orange-500 to-gold text-black py-3 text-sm">Wide</button>
                      <button onClick={() => deliver({ runs: 0, extraType: "noball", extraRuns: 1 })} className="btn-grad bg-gradient-to-r from-gold to-yellow-300 text-black py-3 text-sm">No Ball</button>
                      <button onClick={() => deliver({ runs: 0, extraType: "bye", extraRuns: 1 })} className="btn-grad bg-gradient-to-r from-electric to-cyan-400 text-black py-3 text-sm">Bye</button>
                      <button onClick={() => deliver({ runs: 0, extraType: "legbye", extraRuns: 1 })} className="btn-grad bg-gradient-to-r from-royal to-magenta py-3 text-sm">Leg Bye</button>
                    </div>
                    <button onClick={() => setShowWicketModal(true)} disabled={actionLoading} className="w-full btn-grad bg-gradient-to-r from-crimson to-red-700 py-4 mt-2 text-lg">WICKET</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ⚡ Modals rendered outside the conditional so they work everywhere */}
      {showEditStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-modal-bg" onClick={() => setShowEditStatsModal(false)}>
          <div className="bg-[#0f1530] border border-[#1e2749] rounded-2xl w-full max-w-md overflow-hidden animate-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-electric to-royal p-4 flex justify-between items-center">
              <h3 className="text-lg font-black text-white flex items-center gap-2"><Settings className="w-5 h-5" /> Edit Match Stats</h3>
              <button onClick={() => setShowEditStatsModal(false)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 font-bold block mb-1">Match Total Overs</label>
                  <input type="number" value={editMatchOvers} onChange={e => setEditMatchOvers(e.target.value)} className="w-full bg-[#0a0e27] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-electric" />
                </div>
                <div>
                  <label className="text-xs text-white/50 font-bold block mb-1">Current Runs</label>
                  <input type="number" value={editRuns} onChange={e => setEditRuns(e.target.value)} className="w-full bg-[#0a0e27] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-electric" />
                </div>
                <div>
                  <label className="text-xs text-white/50 font-bold block mb-1">Current Wickets</label>
                  <input type="number" value={editWickets} onChange={e => setEditWickets(e.target.value)} className="w-full bg-[#0a0e27] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-electric" />
                </div>
                <div>
                  <label className="text-xs text-white/50 font-bold block mb-1">Current Balls</label>
                  <input type="number" value={editBalls} onChange={e => setEditBalls(e.target.value)} className="w-full bg-[#0a0e27] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-electric" />
                </div>
              </div>
              
              {innings?.inningsNumber === 2 && (
                <div>
                  <label className="text-xs text-gold font-bold block mb-1">New Target (DLS)</label>
                  <input type="number" value={editTargetVal} onChange={e => setEditTargetVal(e.target.value)} className="w-full bg-[#0a0e27] border border-gold/50 p-3 rounded-xl text-white outline-none focus:border-gold" />
                </div>
              )}

              <button onClick={handleSaveStats} disabled={actionLoading} className="w-full btn-grad bg-gradient-to-r from-electric to-royal text-white py-3 mt-2 font-bold shadow-glow">
                {actionLoading ? "Saving..." : "Save Changes & Resume Match"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-modal-bg" onClick={() => setShowStartModal(false)}>
          <div className="bg-[#0f1530] border border-[#1e2749] rounded-2xl w-full max-w-md overflow-hidden animate-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-neon to-cyan-400 p-4 flex justify-between items-center">
              <h3 className="text-xl font-black text-black">Start {isFirstInningsOver ? "2nd" : "1st"} Innings ({maxOvers} Overs)</h3>
              <button onClick={() => setShowStartModal(false)} className="text-black/70 hover:text-black transition"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-white/50 font-bold block mb-1">Striker</label>
                <select value={selStriker} onChange={e => setSelStriker(e.target.value)} className="w-full bg-[#0a0e27] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-emerald-neon">
                  <option value="">Select Striker</option>
                  {modalBattingPlayers.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 font-bold block mb-1">Non-Striker</label>
                <select value={selNonStriker} onChange={e => setSelNonStriker(e.target.value)} className="w-full bg-[#0a0e27] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-emerald-neon">
                  <option value="">Select Non-Striker</option>
                  {modalBattingPlayers.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 font-bold block mb-1">Opening Bowler</label>
                <select value={selBowler} onChange={e => setSelBowler(e.target.value)} className="w-full bg-[#0a0e27] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-emerald-neon">
                  <option value="">Select Bowler</option>
                  {modalBowlingPlayers.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <button onClick={startInnings} disabled={actionLoading} className="w-full btn-grad bg-gradient-to-r from-emerald-neon to-cyan-400 text-black py-3 mt-4 text-lg font-bold shadow-glow disabled:opacity-50">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showBatterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-modal-bg">
          <div className="bg-[#0f1530] border border-[#1e2749] rounded-2xl w-full max-w-sm animate-modal-box">
            <div className="bg-gradient-to-r from-crimson to-red-700 p-4 flex justify-between items-center">
              <h3 className="text-lg font-black text-white">New Batter</h3>
              <button onClick={() => setShowBatterModal(false)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-white/70"><span className="text-crimson font-bold">{replaceRole === 'striker' ? innings?.striker : innings?.nonStriker}</span> is out. Select a replacement:</p>
              <div>
                <select value={newBatterName} onChange={e => { setNewBatterName(e.target.value); setBatterError(""); }} className={`w-full bg-[#0a0e27] border ${batterError ? 'border-crimson' : 'border-white/10'} p-3 rounded-xl text-white outline-none focus:border-crimson transition`}>
                  <option value="">Select Batter</option>
                  {availableBatters.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                </select>
                {batterError && <p className="text-crimson text-xs font-bold mt-1.5 animate-pulse">{batterError}</p>}
              </div>
              <button onClick={handleSetNewBatter} disabled={actionLoading} className="w-full btn-grad bg-gradient-to-r from-crimson to-red-700 text-white py-3 mt-2">{actionLoading ? "Adding..." : "Confirm Batter"}</button>
            </div>
          </div>
        </div>
      )}

      {showBowlerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-modal-bg" onClick={() => setShowBowlerModal(false)}>
          <div className="bg-[#0f1530] border border-[#1e2749] rounded-2xl w-full max-w-md animate-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-electric to-royal p-4 flex justify-between items-center">
              <h3 className="text-xl font-black text-white">Over Complete</h3>
              <button onClick={() => setShowBowlerModal(false)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-white/70">Select the bowler for the next over:</p>
              <div>
                <select value={selBowler} onChange={e => { setSelBowler(e.target.value); setBowlerError(""); }} className={`w-full bg-[#0a0e27] border ${bowlerError ? 'border-crimson' : 'border-white/10'} p-3 rounded-xl text-white outline-none focus:border-royal transition`}>
                  <option value="">Select Bowler</option>
                  {allowedBowlers.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                </select>
                {bowlerError && <p className="text-crimson text-xs font-bold mt-1.5 animate-pulse">{bowlerError}</p>}
              </div>
              <button onClick={handleSetBowler} disabled={actionLoading} className="w-full btn-grad bg-gradient-to-r from-electric to-royal text-white py-3 mt-2">{actionLoading ? "Starting..." : "Set Bowler & Start Over"}</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-modal-bg" onClick={() => setShowEditModal(false)}>
          <div className="bg-[#0f1530] border border-[#1e2749] rounded-2xl w-full max-w-sm overflow-hidden animate-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-electric to-royal p-4 flex justify-between items-center">
              <h3 className="text-lg font-black text-white capitalize">Edit {editTarget.role}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-white/50 font-bold block mb-1">Select Correct Player</label>
                <select value={editNewName} onChange={e => setEditNewName(e.target.value)} className="w-full bg-[#0a0e27] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-electric">
                  {(editTarget.role === "bowler" ? modalBowlingPlayers : modalBattingPlayers).map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <button onClick={handleEditPlayer} disabled={actionLoading} className="w-full btn-grad bg-gradient-to-r from-electric to-royal text-white py-3 mt-2">Update Player</button>
            </div>
          </div>
        </div>
      )}

      {showWicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-modal-bg" onClick={() => setShowWicketModal(false)}>
          <div className="bg-[#0f1530] border border-[#1e2749] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-crimson to-red-700 p-4 flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Record Wicket</h3>
              <button onClick={() => setShowWicketModal(false)} className="text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-xs text-[#8892b0] font-bold mb-3 block uppercase tracking-widest">Dismissal Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WICKET_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isActive = wicketType === type.id;
                    return (
                      <button key={type.id} onClick={() => setWicketType(type.id)} className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${isActive ? "bg-crimson/20 border-crimson text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] scale-[1.02]" : "bg-white/5 border-transparent hover:bg-white/10 text-[#8892b0] hover:text-white"}`}>
                        <Icon className={`w-6 h-6 mb-2 ${isActive ? "text-crimson" : "opacity-70"}`} />
                        <span className="text-sm font-bold">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs text-[#8892b0] font-bold mb-3 block uppercase tracking-widest">Who is out?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setDismissedBatter("striker")} className={`py-3 px-4 rounded-xl border transition-all flex flex-col items-start ${dismissedBatter === "striker" ? "bg-royal/20 border-royal text-white" : "bg-white/5 border-transparent hover:bg-white/10 text-[#8892b0]"}`}>
                    <span className="font-bold text-sm">Striker</span>
                    <span className="text-xs text-white/50">{innings?.striker || "—"}</span>
                  </button>
                  <button onClick={() => setDismissedBatter("nonstriker")} className={`py-3 px-4 rounded-xl border transition-all flex flex-col items-start ${dismissedBatter === "nonstriker" ? "bg-royal/20 border-royal text-white" : "bg-white/5 border-transparent hover:bg-white/10 text-[#8892b0]"}`}>
                    <span className="font-bold text-sm">Non-Striker</span>
                    <span className="text-xs text-white/50">{innings?.nonStriker || "—"}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#1e2749] bg-black/20 flex justify-end gap-3">
              <button onClick={() => setShowWicketModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-[#8892b0] hover:text-white">Cancel</button>
              <button onClick={confirmWicket} disabled={actionLoading} className="btn-grad bg-gradient-to-r from-crimson to-red-700 shadow-glow py-2.5">Confirm Wicket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
