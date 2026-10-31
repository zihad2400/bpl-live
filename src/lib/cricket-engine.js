export const isLegalDelivery = (d) => {
  if (d.extraType === 'wide' || d.extraType === 'noball') return false;
  return true;
};

export const computeDelivery = (d) => {
  let teamRuns = 0;
  let batterRuns = 0;
  let bowlerConceded = 0;
  let isLegal = true;

  if (d.extraType === 'wide') {
    const wides = d.extraRuns || 1;
    teamRuns = wides;
    bowlerConceded = wides;
    isLegal = false;
  } else if (d.extraType === 'noball') {
    const nb = d.extraRuns || 1;
    teamRuns = nb + d.runs;
    batterRuns = d.runs;
    bowlerConceded = nb + d.runs;
    isLegal = false;
  } else if (d.extraType === 'bye' || d.extraType === 'legbye') {
    teamRuns = d.runs + (d.extraRuns || 0);
    batterRuns = 0;
    bowlerConceded = 0;
  } else if (d.extraType === 'penalty') {
    teamRuns = d.extraRuns || 5;
    batterRuns = 0;
    bowlerConceded = 0;
  } else {
    teamRuns = d.runs;
    batterRuns = d.runs;
    bowlerConceded = d.runs;
  }

  return { teamRuns, batterRuns, bowlerConceded, isLegal };
};

export const applyDelivery = (state, delivery) => {
  const s = JSON.parse(JSON.stringify(state));
  const c = computeDelivery(delivery);

  s.totalRuns += c.teamRuns;
  s.ballsThisOver = c.isLegal ? s.ballsThisOver + 1 : s.ballsThisOver;
  s.totalLegalBalls = c.isLegal ? s.totalLegalBalls + 1 : s.totalLegalBalls;
  s.extras += (c.teamRuns - c.batterRuns);

  // Batter stats
  if (s.striker && Array.isArray(s.batters)) {
    const b = s.batters.find(x => x.name === s.striker);
    if (b) {
      b.runs += c.batterRuns;
      if (c.isLegal) b.balls += 1;
      if (!delivery.extraType && delivery.runs === 4) b.fours += 1;
      if (!delivery.extraType && delivery.runs === 6) b.sixes += 1;
    }
  }

  // Bowler stats
  if (s.bowler && Array.isArray(s.bowlers)) {
    const bw = s.bowlers.find(x => x.name === s.bowler);
    if (bw) {
      bw.runs += c.bowlerConceded;
      if (c.isLegal) {
        bw.legalBalls += 1;
        if (delivery.runs === 0 && !delivery.extraType) bw.dots = (bw.dots || 0) + 1;
      }
      if (delivery.isWicket && delivery.wicketType !== 'runout') bw.wickets += 1;
    }
  }

  // Wicket
  if (delivery.isWicket) {
    s.wickets += 1;
    
    // ⚡ Mark the dismissed batter as OUT
    if (delivery.dismissedBatter === 'striker' && s.striker) {
      const b = s.batters.find(x => x.name === s.striker);
      if (b) b.out = true;
    } else if (delivery.dismissedBatter === 'nonstriker' && s.nonStriker) {
      const b = s.batters.find(x => x.name === s.nonStriker);
      if (b) b.out = true;
    }

    s.fallOfWickets = s.fallOfWickets || [];
    s.fallOfWickets.push({ score: s.totalRuns, wicket: s.wickets, batter: delivery.dismissedBatter });
  }

  // Strike rotation
  const oddRuns = (delivery.runs || 0) % 2 === 1;
  if (oddRuns) [s.striker, s.nonStriker] = [s.nonStriker, s.striker];

  // Over complete → swap strike & reset bowler
  if (s.ballsThisOver >= 6) {
    s.ballsThisOver = 0;
    [s.striker, s.nonStriker] = [s.nonStriker, s.striker];
    s.bowler = null;
    s.overComplete = true;
  }

  return s;
};

export const formatOvers = (legalBalls) => `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
export const runRate = (runs, legalBalls) => legalBalls === 0 ? 0 : +(runs / (legalBalls / 6)).toFixed(2);
export const strikeRate = (runs, balls) => balls === 0 ? 0 : +((runs / balls) * 100).toFixed(2);
export const economy = (runs, legalBalls) => legalBalls === 0 ? 0 : +(runs / (legalBalls / 6)).toFixed(2);
