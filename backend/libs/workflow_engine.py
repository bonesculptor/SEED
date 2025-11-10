def evaluate_chain(models, gate_action):
  allow = gate_action in ('auto_deploy','approve_required')
  out=[]
  if not allow:
    return {'overall':'blocked','models':[{'name':m['name'],'allowed':False,'reason':gate_action} for m in models]}
  serial_block=False
  for m in models:
    if m.get('kind','serial')=='serial':
      allowed=(not serial_block) and m.get('status','ready')=='ready'
      if not allowed: serial_block=True
      out.append({'name':m['name'],'allowed':allowed,'reason':None if allowed else 'serial-block'})
    else:
      allowed=m.get('status','ready')=='ready'
      out.append({'name':m['name'],'allowed':allowed,'reason':None if allowed else 'parallel-unavailable'})
  overall='allowed' if any(r['allowed'] for r in out) else 'blocked'
  return {'overall':overall,'models':out}
