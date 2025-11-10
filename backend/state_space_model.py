class StateSpaceModel:
 def __init__(self,p): self.p=p; self.m=None
 def fit(self,s):
  from statsmodels.tsa.statespace.structural import UnobservedComponents
  self.m=UnobservedComponents(s, level='local level').fit(); return self
 def forecast(self,n): return self.m.forecast(n).tolist()
 def metadata(self): return {'name':'StateSpace','params':self.p}
