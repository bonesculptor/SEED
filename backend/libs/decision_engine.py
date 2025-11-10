import json
ACTIONS={'auto_deploy':{'label':'Auto-Deploy','badge':'✅','color':'green'},'approve_required':{'label':'Approval Required','badge':'🟨','color':'orange'},'review':{'label':'Review','badge':'🟦','color':'blue'},'triage':{'label':'Triage','badge':'🟪','color':'purple'},'quarantine':{'label':'Quarantine','badge':'🟥','color':'red'},'auto_quarantine':{'label':'Auto-Quarantine','badge':'🟥','color':'red'},'auto_rollback':{'label':'Auto-Rollback','badge':'⛔','color':'red'},'rollback':{'label':'Rollback','badge':'⛔','color':'red'}}

def summarize_alerts(rep: dict):
  any_alerts = bool(rep.get('alerts'))
  critical_alerts = False
  return {'any_alerts': any_alerts, 'critical_alerts': critical_alerts, 'all_clear': not any_alerts}

def choose_action(policy: dict, alerts: dict):
  for node in policy.get('decision_tree', []):
    cond=node.get('if',{})
    if all(alerts.get(k)==v for k,v in cond.items()):
      return node.get('then')
  return 'review'
