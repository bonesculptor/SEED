import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ProtocolCardProps {
  title: string;
  subtitle: string;
  data: any;
  validator: any;
  sections: string[];
}

export function ProtocolCard({ title, subtitle, data, validator, sections }: ProtocolCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [validation, setValidation] = useState<any>(null);

  useEffect(() => {
    const result = validator.validate(data);
    setValidation(result);
  }, [data, validator]);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div
        className="p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-slate-900">{title}</h3>
              {validation?.conforms ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              {validation?.warnings?.length > 0 && (
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              )}
            </div>
            <div className="text-sm text-slate-600 mt-1">{subtitle}</div>
          </div>
          <div className="text-sm text-slate-500">
            {expanded ? '▼' : '▶'}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t border-slate-200 space-y-4">
          {validation && (
            <div className="space-y-2">
              {validation.errors?.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Validation Errors</h4>
                  <ul className="space-y-1">
                    {validation.errors.map((error: any, i: number) => (
                      <li key={i} className="text-sm text-red-700">
                        <span className="font-medium">{error.path}:</span> {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.warnings?.length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">Warnings</h4>
                  <ul className="space-y-1">
                    {validation.warnings.map((warning: any, i: number) => (
                      <li key={i} className="text-sm text-orange-700">
                        <span className="font-medium">{warning.path}:</span> {warning.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.conforms && (!validation.warnings || validation.warnings.length === 0) && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">✓ All validation checks passed</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {sections.map((section) => (
              <div key={section}>
                <h4 className="font-medium text-slate-900 mb-2 capitalize">
                  {section.replace(/_/g, ' ')}
                </h4>
                <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(data[section], null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
