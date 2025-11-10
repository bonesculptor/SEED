class ProphetModel:
 def __init__(self,p): self.p=p; self.m=None
 def fit(self,df):
  from prophet import Prophet
  m=Prophet(weekly_seasonality=self.p.get('weekly',True), yearly_seasonality=self.p.get('yearly',True)); m.fit(df); self.m=m; return self
 def forecast(self,n):
  f=self.m.make_future_dataframe(periods=n, include_history=True)
  fc=self.m.predict(f); return fc.tail(n)[['ds','yhat','yhat_lower','yhat_upper']].to_dict(orient='records')
 def metadata(self): return {'name':'Prophet','params':self.p}
