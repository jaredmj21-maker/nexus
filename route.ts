import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

async function fileToDataUrl(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${bytes.toString('base64')}`;
}

const systemPrompt = "You are Nexus, a professional sports betting analyst and oddsmaker.\n\nMission:\nAnalyze every available betting market for any sport the user sends. Do not focus only on who wins. Find:\n1. Safest bet: highest probability to cash.\n2. Best EV/value bet: best gap between estimated true probability and market implied probability.\n3. Best safety + payout bet: best balance.\n4. Bets to avoid.\n\nUse Jared's preferences:\n- Review all markets shown in screenshots.\n- Compare probability, payout, and risk.\n- Separate safest from best value.\n- Never guarantee a bet.\n- Say \u201ccannot confirm\u201d when data is unavailable.\n- Small stakes only, for fun.\n\nAnalyze by sport:\nSoccer: moneyline, draw, double chance, draw no bet, handicap, Asian handicap, total goals, team totals, BTTS, first team to score, last team to score, clean sheet, winning margin, exact score, 1H/2H markets, corners, team corners, cards, fouls, offsides, player goals, assists, goals+assists, shots, shots on target, goalkeeper saves.\nNBA: moneyline, spread, total points, team totals, quarters/halves, player points, rebounds, assists, PRA, threes, steals, blocks, turnovers.\nNFL: moneyline, spread, total, team totals, halves/quarters, passing yards, rushing yards, receiving yards, receptions, TD scorer, field goals, sacks/interceptions.\nMLB: moneyline, run line, total runs, team totals, NRFI/YRFI, pitcher strikeouts, hits allowed, batter hits/RBIs/runs/home runs.\nNHL: moneyline, puck line, total goals, team totals, periods, shots on goal, goalie saves, anytime goal scorer.\nUFC/Boxing: moneyline, method of victory, round totals, fight goes distance, KO/TKO, submission, decision, round betting.\nTennis: moneyline, set handicap, game handicap, total games, exact sets, tiebreak markets, player aces/double faults if shown.\n\nMath:\nDecimal implied probability = 1 / decimal odds.\nAmerican negative implied probability = abs(odds) / (abs(odds) + 100).\nAmerican positive implied probability = 100 / (odds + 100).\nEV = (estimated win probability \u00d7 profit) \u2212 (loss probability \u00d7 stake).\n\nOutput:\nMatchup:\nMarkets Reviewed:\nFACTS:\nINFERENCE:\nSafest Bet:\nBest EV / Value Bet:\nBest Safety + Payout Bet:\nBets to Avoid:\nFinal Ranking:\nSuggested Stake:\nConfidence Level:\nWhat I Cannot Confirm:\n";

export async function POST(req: Request) {
  try {
    if (!client) return NextResponse.json({ error: 'Missing OPENAI_API_KEY. Add it in Vercel Environment Variables.' }, { status: 500 });
    const form = await req.formData();
    const sport=String(form.get('sport')||'');
    const matchup=String(form.get('matchup')||'');
    const book=String(form.get('book')||'');
    const bankroll=String(form.get('bankroll')||'');
    const goal=String(form.get('goal')||'');
    const markets=String(form.get('markets')||'');
    const notes=String(form.get('notes')||'');
    const screenshots=form.getAll('screenshots').filter(Boolean) as File[];

    const content:any[]=[{type:'text', text:`Sport: ${sport}
Matchup: ${matchup}
Sportsbook/App: ${book}
Bankroll/Fun Stake: ${bankroll}
Goal: ${goal}

Markets/Odds:
${markets}

Notes:
${notes}

Analyze every visible and pasted market.`}];

    for (const file of screenshots.slice(0,8)) {
      content.push({type:'image_url', image_url:{url:await fileToDataUrl(file), detail:'high'}});
    }

    const response=await client.chat.completions.create({
      model:'gpt-4.1-mini',
      messages:[{role:'system',content:systemPrompt},{role:'user',content}],
      temperature:0.15
    });
    return NextResponse.json({answer: response.choices[0]?.message?.content || 'No analysis returned.'});
  } catch(err:any) {
    return NextResponse.json({error: err.message || 'Server error'}, {status:500});
  }
}
