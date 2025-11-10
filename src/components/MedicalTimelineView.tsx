import React, { useState, useMemo } from 'react';
import { Calendar, ZoomIn, ZoomOut, Grid3x3, List, Activity } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  type: string;
  title: string;
  summary: string;
  data: any;
  color: string;
  icon: string;
}

interface Props {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

type ViewScale = 'day' | 'week' | 'month' | 'year';
type LayoutMode = 'timeline' | 'table' | 'spectrum';

export default function MedicalTimelineView({ events, onEventClick }: Props) {
  const [scale, setScale] = useState<ViewScale>('month');
  const [layout, setLayout] = useState<LayoutMode>('timeline');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    if (!selectedType) return events;
    return events.filter(e => e.type === selectedType);
  }, [events, selectedType]);

  const eventTypes = useMemo(() => {
    const types = new Set(events.map(e => e.type));
    return Array.from(types);
  }, [events]);

  const dateRange = useMemo(() => {
    if (events.length === 0) return { start: new Date(), end: new Date() };
    const dates = events.map(e => new Date(e.date));
    return {
      start: new Date(Math.min(...dates.map(d => d.getTime()))),
      end: new Date(Math.max(...dates.map(d => d.getTime())))
    };
  }, [events]);

  const getScaleLabel = (scale: ViewScale): string => {
    const labels = { day: 'Days', week: 'Weeks', month: 'Months', year: 'Years' };
    return labels[scale];
  };

  const formatDateForScale = (date: Date, scale: ViewScale): string => {
    switch (scale) {
      case 'day':
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      case 'week':
        return `Week ${Math.ceil(date.getDate() / 7)}, ${date.toLocaleDateString('en-GB', { month: 'short' })}`;
      case 'month':
        return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      case 'year':
        return date.getFullYear().toString();
    }
  };

  const renderTableView = () => {
    const fhirLevels = ['patient', 'practitioner', 'encounter', 'condition', 'medication', 'procedure', 'observation', 'document'];

    const uniqueDates = Array.from(new Set(filteredEvents.map(e => e.date))).sort();

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10">
                FHIR Level
              </th>
              {uniqueDates.map(date => (
                <th key={date} className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700 min-w-[120px]">
                  {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fhirLevels.map(level => {
              const levelEvents = filteredEvents.filter(e => e.type === level);
              if (levelEvents.length === 0) return null;

              return (
                <tr key={level} className="hover:bg-slate-50">
                  <td className="border border-slate-200 px-4 py-3 font-medium text-slate-900 capitalize sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      <span>{levelEvents[0]?.icon}</span>
                      <span>{level}s ({levelEvents.length})</span>
                    </div>
                  </td>
                  {uniqueDates.map(date => {
                    const dayEvents = levelEvents.filter(e => e.date === date);
                    return (
                      <td key={`${level}-${date}`} className="border border-slate-200 px-2 py-2 align-top">
                        <div className="space-y-1">
                          {dayEvents.map(event => (
                            <button
                              key={event.id}
                              onClick={() => onEventClick?.(event)}
                              className="w-full text-left p-2 rounded hover:bg-slate-100 transition-colors text-xs"
                              style={{ borderLeft: `3px solid ${event.color}` }}
                            >
                              <div className="font-medium text-slate-900 truncate">{event.title}</div>
                              {event.summary && (
                                <div className="text-slate-600 truncate mt-0.5">{event.summary}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSpectrumView = () => {
    const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));

    const getPosition = (date: Date): number => {
      const eventTime = date.getTime();
      const startTime = dateRange.start.getTime();
      const totalTime = dateRange.end.getTime() - startTime;
      return ((eventTime - startTime) / totalTime) * 100;
    };

    const fhirLevels = ['patient', 'practitioner', 'encounter', 'condition', 'medication', 'procedure', 'observation', 'document'];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-600">
            {dateRange.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="text-sm font-medium text-slate-900">
            Timeline: {totalDays} days
          </div>
          <div className="text-sm text-slate-600">
            {dateRange.end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        <div className="space-y-4">
          {fhirLevels.map(level => {
            const levelEvents = filteredEvents.filter(e => e.type === level);
            if (levelEvents.length === 0) return null;

            return (
              <div key={level} className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{levelEvents[0]?.icon}</span>
                  <span className="text-sm font-medium text-slate-700 capitalize min-w-[120px]">
                    {level}s ({levelEvents.length})
                  </span>
                </div>

                <div className="relative h-12 bg-slate-100 rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50"></div>

                  {levelEvents.map(event => {
                    const position = getPosition(new Date(event.date));
                    return (
                      <button
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                        style={{ left: `${position}%` }}
                        title={`${event.title} - ${new Date(event.date).toLocaleDateString('en-GB')}`}
                      >
                        <div
                          className="w-3 h-3 rounded-full border-2 border-white shadow-lg group-hover:scale-150 transition-transform"
                          style={{ backgroundColor: event.color }}
                        ></div>
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                          <div className="bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                            {event.title}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTimelineView = () => {
    return (
      <div className="space-y-8">
        {filteredEvents.map((event, index) => (
          <div key={event.id} className="relative flex gap-6">
            <div className="flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl z-10 border-4 border-white shadow-lg flex-shrink-0"
                style={{ backgroundColor: event.color }}
              >
                {event.icon}
              </div>
              {index < filteredEvents.length - 1 && (
                <div className="w-1 flex-1 bg-gradient-to-b from-slate-300 to-slate-100 mt-2"></div>
              )}
            </div>

            <div className="flex-1 pb-8">
              <button
                onClick={() => onEventClick?.(event)}
                className="w-full text-left bg-white border border-slate-200 rounded-lg p-5 hover:shadow-lg hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">
                        {new Date(event.date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({formatDateForScale(new Date(event.date), scale)})
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{event.title}</h3>
                    {event.summary && (
                      <p className="text-sm text-slate-600">{event.summary}</p>
                    )}
                  </div>
                  <span
                    className="px-3 py-1 text-xs font-bold rounded-full ml-4 flex-shrink-0"
                    style={{
                      backgroundColor: event.color + '20',
                      color: event.color
                    }}
                  >
                    {event.type.toUpperCase()}
                  </span>
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Medical Timeline</h2>
            <span className="text-sm text-slate-500">({filteredEvents.length} events)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLayout('timeline')}
              className={`p-2 rounded transition-colors ${layout === 'timeline' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
              title="Timeline View"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLayout('spectrum')}
              className={`p-2 rounded transition-colors ${layout === 'spectrum' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
              title="Spectrum View"
            >
              <Activity className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLayout('table')}
              className={`p-2 rounded transition-colors ${layout === 'table' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
              title="Table View"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Scale:</span>
            <div className="flex gap-1">
              {(['day', 'week', 'month', 'year'] as ViewScale[]).map(s => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    scale === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {getScaleLabel(s)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-medium text-slate-700">Filter:</span>
            <select
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value || null)}
              className="px-3 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No timeline events found</p>
          </div>
        ) : layout === 'table' ? (
          renderTableView()
        ) : layout === 'spectrum' ? (
          renderSpectrumView()
        ) : (
          renderTimelineView()
        )}
      </div>
    </div>
  );
}
