'use client';
import { useState } from 'react';

export default function Home() {
  const [sport,setSport]=useState('Soccer');
  const [matchup,setMatchup]=useState('');
  const [book,setBook]=useState('');
  const [bankroll,setBankroll]=useState('');
  const [goal,setGoal]=useState('Safest possible');
  const [markets,setMarkets]=useState('');
  const [notes,setNotes]=useState('');
  const [files,setFiles]=useState<FileList|null>(null);
  const [answer,setAnswer]=useState('');
  const [loading,setLoading]=useState(false);

  async function analyze(){
    setLoading(true); setAnswer('');
    try{
      const form=new FormData();
      form.append('sport',sport); form.append('matchup',matchup); form.append('book',book);
      form.append('bankroll',bankroll); form.append('goal',goal); form.append('markets',markets); form.append('notes',notes);
      if(files) Array.from(files).forEach(f=>form.append('screenshots',f));
      const res=await fetch('/api/analyze',{method:'POST',body:form});
      const data=await res.json();
      setAnswer(data.answer || data.error || 'No response.');
    }catch(e:any){setAnswer('Error: '+e.message)} finally{setLoading(false)}
  }

  return <main>
    <nav className="nav">
      <div className="brand"><span className="mark"></span><span>Nexus</span></div>
      <div className="navlinks"><span className="pill">Market scanner</span><span className="pill">EV engine</span><span className="pill">Risk ranking</span></div>
    </nav>

    <section className="hero">
      <div className="eyebrow">Sports intelligence</div>
      <h1><span className="gradient">Read the board.</span><br/>Not just the favorite.</h1>
      <p>Nexus reviews every market you show it — sides, totals, props, corners, cards, player lines, fight methods, set markets — then separates the safest play from the best value.</p>
      <div className="heroActions">
        <span className="action primary">Analyze screenshots</span>
        <span className="action">Safest • EV • Avoid list</span>
      </div>
    </section>

    <section className="grid">
      <div className="card">
        <div className="cardHead"><h2>Event profile</h2><span className="sub">Step 01</span></div>
        <label>Sport</label>
        <select value={sport} onChange={e=>setSport(e.target.value)}>
          {['Soccer','NBA','NFL','MLB','NHL','UFC','Boxing','Tennis','Other'].map(s=><option key={s}>{s}</option>)}
        </select>
        <label>Matchup</label><input value={matchup} onChange={e=>setMatchup(e.target.value)} placeholder="Portugal vs DR Congo"/>
        <div className="row">
          <div><label>Book / app</label><input value={book} onChange={e=>setBook(e.target.value)} placeholder="FanDuel, DK, Polymarket"/></div>
          <div><label>Stake context</label><input value={bankroll} onChange={e=>setBankroll(e.target.value)} placeholder="$20 fun bet"/></div>
        </div>
        <label>Objective</label>
        <select value={goal} onChange={e=>setGoal(e.target.value)}>
          <option>Safest possible</option><option>Best EV/value</option><option>Best safety + payout balance</option><option>Longshot fun bet</option>
        </select>
        <div className="modules">
          <div className="module"><b>Safety</b><span>Highest hit rate</span></div>
          <div className="module"><b>Value</b><span>Price gap</span></div>
          <div className="module"><b>Balance</b><span>Risk/reward</span></div>
          <div className="module"><b>Avoid</b><span>Bad markets</span></div>
        </div>
      </div>

      <div className="card">
        <div className="cardHead"><h2>Market input</h2><span className="sub">Step 02</span></div>
        <label>Paste odds / markets</label>
        <textarea value={markets} onChange={e=>setMarkets(e.target.value)} placeholder="Moneyline, spread, totals, props, percentages, odds..."/>
        <label>Upload screenshots</label>
        <input type="file" accept="image/*" multiple onChange={e=>setFiles(e.target.files)}/>
        <label>Notes</label>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Lineups, injuries, weather, motivation, your concerns..."/>
        <button disabled={loading || (!matchup && !markets && !files)} onClick={analyze}>{loading?'Scanning markets...':'Run Nexus Analysis'}</button>
      </div>

      <div className="card full">
        <div className="cardHead"><h2>Agent report</h2><span className="sub">Output</span></div>
        {answer ? <div className="report">{answer}</div> : <div className="empty">Your ranked report will appear here after analysis.</div>}
        <div className="warning">For entertainment and research only. No pick is guaranteed. Use small stakes and follow your local laws.</div>
      </div>
    </section>

    <footer className="footer">Nexus does not place bets or guarantee profit.</footer>
  </main>
}
