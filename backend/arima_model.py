class ARIMAModel:
 def __init__(self,p): self.p=p; self.m=None
 def fit(self,s):
  from statsmodels.tsa.arima.model import ARIMA
  self.m=ARIMA(s, order=(1,1,1)).fit(); return self
 def forecast(self,n): return self.m.forecast(steps=n).tolist()
 def metadata(self): return {'name':'ARIMA','params':self.p}
