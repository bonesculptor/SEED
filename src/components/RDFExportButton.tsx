import React, { useState } from 'react';
import { Download, FileCode } from 'lucide-react';
import { rdfExporter } from '../services/rdfExporter';

interface Props {
  protocol: any;
  className?: string;
}

export function RDFExportButton({ protocol, className = '' }: Props) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      await rdfExporter.exportToFile(protocol);
    } catch (error) {
      console.error('Failed to export RDF:', error);
      alert('Failed to export protocol to RDF/Turtle format');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className={`flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-dark-hover text-slate-700 dark:text-dark-text rounded-lg hover:bg-slate-200 dark:hover:bg-dark-surface transition-colors disabled:opacity-50 text-sm ${className}`}
      title="Export to RDF/Turtle format"
    >
      <FileCode className="w-4 h-4" />
      {exporting ? 'Exporting...' : 'Export RDF'}
    </button>
  );
}

interface MultiExportProps {
  protocols: any[];
  protocolType?: string;
  className?: string;
}

export function RDFMultiExportButton({ protocols, protocolType, className = '' }: MultiExportProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (protocols.length === 0) {
      alert('No protocols to export');
      return;
    }

    try {
      setExporting(true);
      const filename = protocolType
        ? `${protocolType}-protocols-${Date.now()}.ttl`
        : `all-protocols-${Date.now()}.ttl`;
      await rdfExporter.exportMultipleToFile(protocols, filename);
    } catch (error) {
      console.error('Failed to export RDF:', error);
      alert('Failed to export protocols to RDF/Turtle format');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || protocols.length === 0}
      className={`flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-cyber-blue text-white rounded-lg hover:bg-blue-700 dark:hover:bg-cyber-blue-glow transition-colors disabled:opacity-50 ${className}`}
      title={`Export ${protocols.length} protocol(s) to RDF/Turtle format`}
    >
      <Download className="w-4 h-4" />
      {exporting ? 'Exporting...' : `Export All (${protocols.length})`}
    </button>
  );
}
