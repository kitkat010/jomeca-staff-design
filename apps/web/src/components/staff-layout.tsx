import {createContext,useContext} from 'react';
import {Outlet,useLocation} from 'react-router';
import {LayoutDashboard,CalendarDays,ChartNoAxesCombined,SlidersHorizontal,Wrench} from 'lucide-react';
import type {StaffSession} from '@jomeca/shared';
import {DashboardShell01} from '@/components/dashboard-shell-01';
import {previewSession} from '@/lib/design-fixtures';
const Context=createContext<StaffSession>(previewSession);
export function useStaffSession(){return useContext(Context);}
const destinations=[{to:'/staff',label:'Overview',icon:LayoutDashboard},{to:'/staff/operations',label:'Reservations',icon:CalendarDays},{to:'/staff/reports',label:'Reports',icon:ChartNoAxesCombined},{to:'/staff/booking',label:'Booking settings',icon:SlidersHorizontal},{to:'/staff/maintenance',label:'Facility maintenance',icon:Wrench,parent:'/staff/booking'}];
export function StaffLayout(){const {pathname}=useLocation();return <Context.Provider value={previewSession}><DashboardShell01 session={previewSession} title={destinations.find(item=>item.to===pathname)?.label??'Staff preview'} destinations={destinations} busy={false} signOut={()=>window.location.assign('https://jomecacentercom-33lf.vercel.app/')}><main id='main' tabIndex={-1} className='staff-main'><p style={{marginBottom:20,padding:'10px 14px',background:'#eef4ec',borderRadius:8,fontSize:12,color:'#42634e'}}>Design preview · Sample data only · Saving and payments are disabled</p><Outlet/></main></DashboardShell01></Context.Provider>;}
