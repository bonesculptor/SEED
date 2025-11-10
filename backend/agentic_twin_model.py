class AgenticTwinModel:
 def __init__(self,p): self.p=p; self.last=None
 def fit(self,s): self.last=s; return self
 def forecast(self,n):
  if not self.last: return []
  return [self.last[-1]]*int(n)
 def metadata(self): return {'name':'AgenticTwin','params':self.p,'status':'stub'}
