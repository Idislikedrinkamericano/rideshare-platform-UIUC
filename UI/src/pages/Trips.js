import React,{useCallback,useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../api';
import RideCard from '../components/RideCard';

export default function Trips(){
  const nav=useNavigate();
  const [rides,setRides]=useState([]); const [incoming,setIncoming]=useState([]); const [mine,setMine]=useState([]); const [message,setMessage]=useState('');
  const load=useCallback(async()=>{if(!localStorage.getItem('weshare_token'))return nav('/login');try{const [t,i,m]=await Promise.all([api.get('/trips'),api.get('/requests/incoming'),api.get('/requests/mine')]);setRides(t.data);setIncoming(i.data);setMine(m.data);}catch{setMessage('Could not load your dashboard. Make sure the API is running.');}},[nav]);
  useEffect(()=>{load();},[load]);
  const decide=async(id,status)=>{try{await api.patch(`/requests/${id}`,{status});setMessage(status==='approved'?'Seat approved.':'Request declined.');load();}catch(e){setMessage(e.response?.data?.error||'Could not update the request.');}};
  const rate=async(rideId,rating)=>{try{await api.post('/ratings',{ride_id:rideId,rating});setMessage(`Thanks — ${rating}★ rating saved.`);}catch(e){setMessage(e.response?.data?.error||'Could not save rating.');}};
  const removeRide=async(id)=>{try{await api.delete(`/rides/${id}`);setMessage('Ride deleted.');load();}catch(e){setMessage(e.response?.data?.error||'Could not delete ride.');}};
  const pastApproved=mine.filter(r=>r.status==='approved'&&new Date(r.ride_time)<new Date());
  return <main className="page"><div className="section-head"><div className="page-title"><div className="eyebrow">Your dashboard</div><h1>My trips</h1><p>Driving, passenger trips, and ride requests in one place.</p></div><button className="button" onClick={()=>nav('/create')}>+ Offer a ride</button></div>{message&&<div className="notice dashboard-note">{message}</div>}
  <section className="dashboard-section"><h2>Upcoming trips</h2><div className="rides-grid">{rides.map(r=><RideCard key={r.id} ride={r} onDelete={r.role==='driver'?removeRide:undefined}/>)}{!rides.length&&<div className="empty"><h3>No trips yet</h3><p>Find a ride or offer one to get started.</p><button className="button" onClick={()=>nav('/rides')}>Browse rides</button></div>}</div></section>
  <section className="dashboard-section"><div className="section-head compact-head"><div><div className="eyebrow">For drivers</div><h2>Seat requests</h2></div></div><div className="request-list">{incoming.map(r=><article className="request-row" key={r.id}><div><b>{r.passenger_username}</b><span>{r.starting_location} → {r.end_destination}</span><small>{new Date(r.ride_time).toLocaleString()}</small></div><span className={`status ${r.status}`}>{r.status}</span>{r.status==='pending'&&<div className="request-actions"><button className="ghost" onClick={()=>decide(r.id,'rejected')}>Decline</button><button className="button small" onClick={()=>decide(r.id,'approved')}>Approve</button></div>}</article>)}{!incoming.length&&<div className="subtle-empty">No incoming requests.</div>}</div></section>
  {pastApproved.length>0&&<section className="dashboard-section"><div className="eyebrow">After the ride</div><h2>Rate your drivers</h2><div className="request-list">{pastApproved.map(r=><article className="request-row" key={r.id}><div><b>{r.driver_username}</b><span>{r.starting_location} → {r.end_destination}</span></div><div className="stars">{[1,2,3,4,5].map(n=><button key={n} aria-label={`${n} stars`} onClick={()=>rate(r.ride_id,n)}>★</button>)}</div></article>)}</div></section>}
  </main>;
}
