import React, { useState, useEffect, useRef } from 'react';
import { User, FileText, Activity, Pill, Stethoscope, FlaskConical, ClipboardList, Plus, Edit2, Trash2, Eye, Database, Upload, Download, RefreshCw, Link, CheckCircle, FileUp, File } from 'lucide-react';
import { personalMedicalRecordService } from '../services/personalMedicalRecordService';
import { medicalRecordIOService } from '../services/medicalRecordIOService';
import { documentUploadService } from '../services/documentUploadService';
import { seedSimonGrangeData } from '../scripts/seedSimonGrangeData';
import { fhirGraphSync } from '../services/fhirGraphSync';
import { llmService } from '../services/llmService';
import NavigationMenu from './NavigationMenu';

type RecordType = 'patient' | 'practitioner' | 'encounter' | 'condition' | 'medication' | 'procedure' | 'observation' | 'document';

interface Record {
  id: string;
  type: RecordType;
  title: string;
  summary: string;
  created_at: string;
  data: any;
}

export default function PersonalMedicalRecordManager() {
  const [activeTab, setActiveTab] = useState<RecordType>('patient');
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [viewingRecord, setViewingRecord] = useState<Record | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const tabs = [
    { id: 'patient' as RecordType, label: 'Patient Info', icon: User, color: 'blue' },
    { id: 'practitioner' as RecordType, label: 'Practitioners', icon: Stethoscope, color: 'purple' },
    { id: 'encounter' as RecordType, label: 'Encounters', icon: Activity, color: 'green' },
    { id: 'condition' as RecordType, label: 'Conditions', icon: ClipboardList, color: 'red' },
    { id: 'medication' as RecordType, label: 'Medications', icon: Pill, color: 'orange' },
    { id: 'procedure' as RecordType, label: 'Procedures', icon: FlaskConical, color: 'cyan' },
    { id: 'observation' as RecordType, label: 'Observations', icon: Activity, color: 'teal' },
    { id: 'document' as RecordType, label: 'Documents', icon: FileText, color: 'slate' }
  ];

  useEffect(() => {
    loadRecords();
  }, [activeTab]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await personalMedicalRecordService.getRecordsByType(activeTab);
      setRecords(data);
    } catch (error) {
      console.error('Error loading records:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      await personalMedicalRecordService.deleteRecord(activeTab, id);
      await loadRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleView = (record: Record) => {
    setViewingRecord(record);
  };

  const handleViewDocument = async (record: Record) => {
    try {
      const { data, error } = await supabase
        .from('document_files')
        .select('file_data, file_type, filename')
        .eq('id', record.id)
        .maybeSingle();

      if (error || !data) {
        alert('Could not load document');
        console.error('Error loading document:', error);
        return;
      }

      const uint8Array = new Uint8Array(data.file_data);
      const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
      const dataUrl = `data:${data.file_type || 'application/pdf'};base64,${base64}`;

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${data.filename || 'Document'}</title></head>
            <body style="margin:0">
              <embed src="${dataUrl}" type="${data.file_type || 'application/pdf'}" width="100%" height="100%" />
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Error opening document');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRecord(null);
    loadRecords();
  };

  const handleSeedData = async () => {
    if (!confirm('This will seed Simon Grange\'s medical records and create FHIR graph connections. Continue?')) return;

    setSeeding(true);
    try {
      const result = await seedSimonGrangeData();

      if (result.patient) {
        await fhirGraphSync.syncPatientToProtocols(result.patient.id);
        await fhirGraphSync.propagatePatientData(result.patient.id);
      }

      const validation = await fhirGraphSync.validateGraphIntegrity();
      console.log('Graph validation:', validation);

      alert(`Successfully seeded Simon Grange medical records!\n\nTotal: 29 records\nGraph edges: 24+\nValidation: ${validation.valid ? 'Passed' : 'Issues found'}`);
      await loadRecords();
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Error seeding data. Check console for details.');
    }
    setSeeding(false);
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingDocument(true);
    try {
      const result = await documentUploadService.uploadDocument(file);

      if (result.success) {
        alert(`${result.message}\n\nWatch the console for extraction progress.\n\nThe page will auto-refresh when complete.`);

        setActiveTab('document');

        setTimeout(async () => {
          await loadRecords();
          await syncGraphData();
          console.log('✅ Records refreshed and graph synced!');
        }, 3000);

        setTimeout(async () => {
          await loadRecords();
          await syncGraphData();
          console.log('✅ Second refresh complete!');
        }, 6000);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Document upload error:', error);
      alert('Error uploading document. Please try again.');
    }
    setUploadingDocument(false);
    if (documentInputRef.current) documentInputRef.current.value = '';
  };

  const syncGraphData = async () => {
    try {
      console.log('Graph sync disabled (fhir_graph_nodes table missing)');
      // TODO: Fix graph sync - table schema mismatch
      // await fhirGraphSync.syncAllFHIRData();
    } catch (error) {
      console.error('Error syncing graph:', error);
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      let result;

      if (file.name.endsWith('.json')) {
        result = await medicalRecordIOService.importFHIRJSON(text);
      } else if (file.name.endsWith('.xml')) {
        result = await medicalRecordIOService.importFHIRXML(text);
      } else {
        throw new Error('Unsupported file format. Use JSON or XML.');
      }

      if (result.success) {
        alert(`Successfully imported ${result.recordsCreated} records!`);
        await loadRecords();
      } else {
        alert(`Import completed with errors:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert(`Error importing file: ${error}`);
    }
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportJSON = async () => {
    try {
      const jsonData = await medicalRecordIOService.exportToJSON();
      medicalRecordIOService.downloadFile(
        jsonData,
        `medical-records-${new Date().toISOString().split('T')[0]}.json`,
        'application/json'
      );
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting to JSON');
    }
  };

  const handleExportXML = async () => {
    try {
      const xmlData = await medicalRecordIOService.exportToXML();
      medicalRecordIOService.downloadFile(
        xmlData,
        `medical-records-${new Date().toISOString().split('T')[0]}.xml`,
        'application/xml'
      );
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting to XML');
    }
  };

  const handleExportPDF = async () => {
    try {
      const pdfBlob = await medicalRecordIOService.exportToPDF();
      medicalRecordIOService.downloadFile(
        pdfBlob,
        `medical-records-${new Date().toISOString().split('T')[0]}.html`,
        'text/html'
      );
      setShowExportMenu(false);
      alert('HTML report generated. Open in browser and print to PDF.');
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting to PDF');
    }
  };

  const handleExportRecords = async () => {
    try {
      const graphData = await personalMedicalRecordService.getGraphData();
      const dataStr = JSON.stringify(graphData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medical-records-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting records:', error);
    }
  };

  const handleSyncToProtocols = async () => {
    if (activeTab !== 'patient' || records.length === 0) {
      alert('Please select a patient record first');
      return;
    }

    const patientId = records[0].id;

    try {
      setLoading(true);
      await fhirGraphSync.syncPatientToProtocols(patientId);
      await fhirGraphSync.propagatePatientData(patientId);

      const validation = await fhirGraphSync.validateGraphIntegrity();

      alert(`Sync complete!\n\nValidation: ${validation.valid ? 'Passed' : 'Issues found'}\n${validation.issues.length > 0 ? '\nIssues:\n' + validation.issues.join('\n') : ''}`);
      await loadRecords();
    } catch (error) {
      console.error('Error syncing to protocols:', error);
      alert('Error syncing. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const activeTabInfo = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <NavigationMenu currentPath="/medical-records" />

      <div className="max-w-7xl mx-auto p-6 pl-20">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-600" />
                Personal Medical Record Manager
              </h1>
              <p className="text-slate-600 mt-2">Comprehensive FHIR R4 compliant health record system</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Database className="w-5 h-5" />
                  Actions
                </button>
                {showActions && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                    <button
                      onClick={() => {
                        handleSeedData();
                        setShowActions(false);
                      }}
                      disabled={seeding}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 text-left text-slate-700 border-b border-slate-100"
                    >
                      <Upload className="w-4 h-4" />
                      {seeding ? 'Seeding...' : 'Load Sample Data'}
                    </button>
                    <button
                      onClick={() => {
                        documentInputRef.current?.click();
                        setShowActions(false);
                      }}
                      disabled={uploadingDocument}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 text-left text-slate-700 border-b border-slate-100"
                    >
                      <File className="w-4 h-4" />
                      {uploadingDocument ? 'Uploading...' : 'Upload Document (PDF/Image)'}
                    </button>
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowActions(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 text-left text-slate-700 border-b border-slate-100"
                    >
                      <FileUp className="w-4 h-4" />
                      Import FHIR (JSON/XML)
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50 text-left text-slate-700 border-b border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Export Records
                        </div>
                        <span className="text-xs">▶</span>
                      </button>
                      {showExportMenu && (
                        <div className="absolute left-full top-0 ml-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200">
                          <button
                            onClick={handleExportJSON}
                            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 text-left text-slate-700 border-b border-slate-100"
                          >
                            <FileText className="w-4 h-4" />
                            Export as FHIR JSON
                          </button>
                          <button
                            onClick={handleExportXML}
                            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 text-left text-slate-700 border-b border-slate-100"
                          >
                            <FileText className="w-4 h-4" />
                            Export as FHIR XML
                          </button>
                          <button
                            onClick={handleExportPDF}
                            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 text-left text-slate-700"
                          >
                            <FileText className="w-4 h-4" />
                            Export as HTML/PDF
                          </button>
                        </div>
                      )}
                    </div>
                    {activeTab === 'patient' && records.length > 0 && (
                      <button
                        onClick={() => {
                          handleSyncToProtocols();
                          setShowActions(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 text-left text-slate-700 border-b border-slate-100"
                      >
                        <Link className="w-4 h-4" />
                        Sync to Protocols
                      </button>
                    )}
                    <button
                      onClick={() => {
                        loadRecords();
                        setShowActions(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 text-left text-slate-700"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh Data
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.xml"
                  onChange={handleImportFile}
                  className="hidden"
                />
                <input
                  ref={documentInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleDocumentUpload}
                  className="hidden"
                />
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add {activeTabInfo?.label}
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? `bg-${tab.color}-600 text-white shadow-lg`
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTabInfo && <activeTabInfo.icon className="w-8 h-8 text-slate-400" />}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No {activeTabInfo?.label} Found</h3>
            <p className="text-slate-600 mb-4">Get started by adding your first record</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add {activeTabInfo?.label}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map(record => (
              <div key={record.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {activeTab === 'document' && (
                      <div className="bg-red-100 p-3 rounded-lg">
                        <FileText className="w-8 h-8 text-red-600" />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-slate-900">{record.title}</h3>
                  </div>
                  <div className="flex gap-1">
                    {activeTab === 'document' ? (
                      <button
                        onClick={() => handleViewDocument(record)}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors flex items-center gap-1"
                        title="View PDF"
                      >
                        <Eye className="w-4 h-4" />
                        View PDF
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleView(record)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{record.summary}</p>
                <p className="text-xs text-slate-400">
                  {new Date(record.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <RecordFormModal
          type={activeTab}
          record={editingRecord}
          onClose={handleFormClose}
        />
      )}

      {viewingRecord && (
        <RecordViewModal
          record={viewingRecord}
          onClose={() => setViewingRecord(null)}
        />
      )}
    </div>
  );
}

function RecordFormModal({ type, record, onClose }: { type: RecordType; record: Record | null; onClose: () => void }) {
  const [formData, setFormData] = useState<any>(record?.data || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (record) {
        await personalMedicalRecordService.updateRecord(type, record.id, formData);
      } else {
        await personalMedicalRecordService.createRecord(type, formData);
      }
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Error saving record. Check console for details.');
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const text = await file.text();
      const prompt = `Extract ${type} information from this document and return as JSON. For patient: extract name, birthDate (YYYY-MM-DD), gender, nhsNumber, phone, address. Return only valid JSON, no markdown.`;

      const extracted = await llmService.extractStructuredData(text, prompt);
      setFormData({ ...formData, ...extracted });
    } catch (error) {
      console.error('Error extracting document data:', error);
      alert('Could not extract data from document. Please fill manually.');
    }
    setUploadingDoc(false);
  };

  const renderFormFields = () => {
    switch (type) {
      case 'patient':
        return (
          <>
            <FormField label="Full Name" value={formData.name || ''} onChange={(v) => setFormData({...formData, name: v})} required />
            <FormField label="Date of Birth" type="date" value={formData.birthDate || ''} onChange={(v) => setFormData({...formData, birthDate: v})} required />
            <FormField label="Gender" type="select" options={['Male', 'Female', 'Other']} value={formData.gender || ''} onChange={(v) => setFormData({...formData, gender: v})} />
            <FormField label="NHS Number" value={formData.nhsNumber || ''} onChange={(v) => setFormData({...formData, nhsNumber: v})} />
            <FormField label="Phone" value={formData.phone || ''} onChange={(v) => setFormData({...formData, phone: v})} />
            <FormField label="Address" type="textarea" value={formData.address || ''} onChange={(v) => setFormData({...formData, address: v})} />
          </>
        );
      case 'practitioner':
        return (
          <>
            <FormField label="Name" value={formData.name || ''} onChange={(v) => setFormData({...formData, name: v})} required />
            <FormField label="Specialty" value={formData.specialty || ''} onChange={(v) => setFormData({...formData, specialty: v})} />
            <FormField label="Organization" value={formData.organization || ''} onChange={(v) => setFormData({...formData, organization: v})} />
            <FormField label="Contact" value={formData.contact || ''} onChange={(v) => setFormData({...formData, contact: v})} />
          </>
        );
      case 'encounter':
        return (
          <>
            <FormField label="Type" value={formData.type || ''} onChange={(v) => setFormData({...formData, type: v})} required />
            <FormField label="Date" type="date" value={formData.date || ''} onChange={(v) => setFormData({...formData, date: v})} required />
            <FormField label="Location" value={formData.location || ''} onChange={(v) => setFormData({...formData, location: v})} />
            <FormField label="Practitioner" value={formData.practitioner || ''} onChange={(v) => setFormData({...formData, practitioner: v})} />
            <FormField label="Reason" type="textarea" value={formData.reason || ''} onChange={(v) => setFormData({...formData, reason: v})} />
          </>
        );
      case 'condition':
        return (
          <>
            <FormField label="Condition Name" value={formData.name || ''} onChange={(v) => setFormData({...formData, name: v})} required />
            <FormField label="Clinical Status" type="select" options={['Active', 'Resolved', 'Inactive']} value={formData.clinicalStatus || ''} onChange={(v) => setFormData({...formData, clinicalStatus: v})} />
            <FormField label="Severity" type="select" options={['Mild', 'Moderate', 'Severe']} value={formData.severity || ''} onChange={(v) => setFormData({...formData, severity: v})} />
            <FormField label="Onset Date" type="date" value={formData.onsetDate || ''} onChange={(v) => setFormData({...formData, onsetDate: v})} />
            <FormField label="Notes" type="textarea" value={formData.notes || ''} onChange={(v) => setFormData({...formData, notes: v})} />
          </>
        );
      case 'medication':
        return (
          <>
            <FormField label="Medication Name" value={formData.name || ''} onChange={(v) => setFormData({...formData, name: v})} required />
            <FormField label="Dosage" value={formData.dosage || ''} onChange={(v) => setFormData({...formData, dosage: v})} />
            <FormField label="Frequency" value={formData.frequency || ''} onChange={(v) => setFormData({...formData, frequency: v})} />
            <FormField label="Route" value={formData.route || ''} onChange={(v) => setFormData({...formData, route: v})} />
            <FormField label="Start Date" type="date" value={formData.startDate || ''} onChange={(v) => setFormData({...formData, startDate: v})} />
            <FormField label="End Date" type="date" value={formData.endDate || ''} onChange={(v) => setFormData({...formData, endDate: v})} />
            <FormField label="Prescriber" value={formData.prescriber || ''} onChange={(v) => setFormData({...formData, prescriber: v})} />
          </>
        );
      case 'procedure':
        return (
          <>
            <FormField label="Procedure Name" value={formData.name || ''} onChange={(v) => setFormData({...formData, name: v})} required />
            <FormField label="Date" type="date" value={formData.date || ''} onChange={(v) => setFormData({...formData, date: v})} required />
            <FormField label="Performer" value={formData.performer || ''} onChange={(v) => setFormData({...formData, performer: v})} />
            <FormField label="Location" value={formData.location || ''} onChange={(v) => setFormData({...formData, location: v})} />
            <FormField label="Outcome" value={formData.outcome || ''} onChange={(v) => setFormData({...formData, outcome: v})} />
            <FormField label="Notes" type="textarea" value={formData.notes || ''} onChange={(v) => setFormData({...formData, notes: v})} />
          </>
        );
      case 'observation':
        return (
          <>
            <FormField label="Observation Type" value={formData.type || ''} onChange={(v) => setFormData({...formData, type: v})} required />
            <FormField label="Value" value={formData.value || ''} onChange={(v) => setFormData({...formData, value: v})} required />
            <FormField label="Unit" value={formData.unit || ''} onChange={(v) => setFormData({...formData, unit: v})} />
            <FormField label="Date" type="date" value={formData.date || ''} onChange={(v) => setFormData({...formData, date: v})} />
            <FormField label="Notes" type="textarea" value={formData.notes || ''} onChange={(v) => setFormData({...formData, notes: v})} />
          </>
        );
      case 'document':
        return (
          <>
            <FormField label="Document Title" value={formData.title || ''} onChange={(v) => setFormData({...formData, title: v})} required />
            <FormField label="Document Type" value={formData.type || ''} onChange={(v) => setFormData({...formData, type: v})} />
            <FormField label="Date" type="date" value={formData.date || ''} onChange={(v) => setFormData({...formData, date: v})} />
            <FormField label="Author" value={formData.author || ''} onChange={(v) => setFormData({...formData, author: v})} />
            <FormField label="Description" type="textarea" value={formData.description || ''} onChange={(v) => setFormData({...formData, description: v})} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {record ? 'Edit' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1)}
            {saved && <CheckCircle className="w-5 h-5 text-green-600" />}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        {saved ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Record Saved Successfully!</h3>
            <p className="text-slate-600">Closing...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {!record && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer text-blue-900 font-medium">
                  <FileUp className="w-5 h-5" />
                  Upload Document to Auto-Fill
                  <input
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    disabled={uploadingDoc}
                  />
                </label>
                {uploadingDoc && <p className="text-sm text-blue-700 mt-2">Extracting data from document...</p>}
                <p className="text-xs text-blue-700 mt-1">Upload a medical document to automatically extract and fill form fields</p>
              </div>
            )}

            <div className="space-y-4">
              {renderFormFields()}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Record'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', required = false, options = [], ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select...</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          {...props}
        />
      )}
    </div>
  );
}

function RecordViewModal({ record, onClose }: { record: Record; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{record.title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-slate-600">{record.summary}</p>
            <p className="text-xs text-slate-400 mt-2">
              Created: {new Date(record.created_at).toLocaleString('en-GB')}
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(record.data).map(([key, value]) => (
              <div key={key} className="border-b pb-2">
                <dt className="text-sm font-medium text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                <dd className="text-sm text-slate-900 mt-1">{String(value)}</dd>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
