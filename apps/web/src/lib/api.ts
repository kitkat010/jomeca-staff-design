import {catalog,configuration,reservations,payments,previewSession} from './design-fixtures';
// Deliberately no fetch or server connections. All data is synthetic; all writes fail.
export async function api<T>(input:string,options?:RequestInit):Promise<T>{
 if(options?.method&&options.method!=='GET')throw Error('Design preview only — no changes or payments were saved.');
 const url=new URL(input,'https://design.invalid');let data:unknown;
 if(url.pathname==='/auth/session')data=previewSession;
 else if(url.pathname==='/booking/catalog')data=catalog;
 else if(url.pathname==='/admin/booking/config')data=configuration;
 else if(url.pathname==='/admin/booking/audit')data={events:[]};
 else if(url.pathname==='/admin/payments/config'||url.pathname==='/admin/payments/channels')data=payments;
 else if(url.pathname==='/admin/event-enquiries')data={enquiries:[]};
 else if(url.pathname==='/admin/reservations')data={reservations:reservations.filter(row=>(!url.searchParams.get('from')||row.startsAt.slice(0,10)>=url.searchParams.get('from')!)&&(!url.searchParams.get('to')||row.startsAt.slice(0,10)<=url.searchParams.get('to')!))};
 else if(url.pathname.startsWith('/admin/reservations/')){data=reservations.find(row=>row.reference===decodeURIComponent(url.pathname.split('/').pop()!));if(!data)throw Error('Sample ticket not found');}
 else throw Error('This feature requires the connected staff portal.');
 return structuredClone(data) as T;
}
