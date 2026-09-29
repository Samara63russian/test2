import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KanbanView } from './components/KanbanView';
import { TableView } from './components/TableView';
import { CardFeedView } from './components/CardFeedView';
import { AnalyticsView } from './components/AnalyticsView';
import { RequestDetailModal } from './components/RequestDetailModal';
import { NewRequestModal } from './components/NewRequestModal';
import { UploadEmlModal } from './components/UploadEmlModal';
import { SettingsModal } from './components/SettingsModal';
import confetti from 'canvas-confetti';

export function App() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    statusCounts: {},
    categoryCounts: {},
    urgencyCounts: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View & Filter states
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'table', 'cards', 'analytics'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'ALL',
    urgency: 'ALL',
    status: 'ALL',
    assigned_to: 'ALL'
  });

  // Modal states
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Background action spinners
  const [isFetchingImap, setIsFetchingImap] = useState(false);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Requests & Stats
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [reqRes, statsRes] = await Promise.all([
        api.getRequests({
          category: filters.category,
          urgency: filters.urgency,
          status: filters.status,
          assigned_to: filters.assigned_to,
          search: searchQuery
        }),
        api.getRequestStats()
      ]);

      setRequests(reqRes.data || []);
      setStats({
        total: statsRes.total || 0,
        statusCounts: statsRes.statusCounts || {},
        categoryCounts: statsRes.categoryCounts || {},
        urgencyCounts: statsRes.urgencyCounts || {}
      });
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  // Initial load and filter change trigger
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time Server-Sent Events (SSE) listener
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onopen = () => {
      setIsLiveConnected(true);
    };

    eventSource.addEventListener('request_created', (e) => {
      const data = JSON.parse(e.data);
      showToast(`Новое письмо: "${data.subject.slice(0, 45)}..."`, 'info');
      loadData();
    });

    eventSource.addEventListener('request_updated', () => {
      loadData();
    });

    eventSource.addEventListener('request_deleted', () => {
      loadData();
    });

    eventSource.addEventListener('new_emails_imported', (e) => {
      const data = JSON.parse(e.data);
      showToast(`Импортировано новых писем: ${data.count}`, 'success');
      loadData();
    });

    eventSource.addEventListener('samples_seeded', () => {
      loadData();
    });

    eventSource.onerror = () => {
      setIsLiveConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [loadData]);

  // Actions
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateRequest(id, { status: newStatus });
      if (newStatus === 'WON') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
      loadData();
    } catch (err) {
      showToast('Ошибка обновления статуса: ' + err.message, 'error');
    }
  };

  const handleBatchUpdateStatus = async (ids, newStatus) => {
    try {
      await api.batchUpdateStatus(ids, newStatus);
      showToast(`Обновлено записей: ${ids.length}`, 'success');
      loadData();
    } catch (err) {
      showToast('Ошибка массового обновления: ' + err.message, 'error');
    }
  };

  const handleBatchDelete = async (ids) => {
    try {
      await api.batchDelete(ids);
      showToast(`Удалено записей: ${ids.length}`, 'success');
      loadData();
    } catch (err) {
      showToast('Ошибка удаления: ' + err.message, 'error');
    }
  };

  const handleFetchImap = async () => {
    try {
      setIsFetchingImap(true);
      const res = await api.fetchImap(10);
      showToast(res.message, res.count > 0 ? 'success' : 'info');
      loadData();
    } catch (err) {
      showToast('Ошибка сбора почты: ' + err.message, 'error');
    } finally {
      setIsFetchingImap(false);
    }
  };

  const handleGenerateSample = async () => {
    try {
      setIsGeneratingSample(true);
      const res = await api.generateSample();
      showToast(`ИИ обработал новое письмо: "${res.data.subject.slice(0, 40)}..."`, 'success');
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.2 } });
      loadData();
    } catch (err) {
      showToast('Ошибка генерации письма: ' + err.message, 'error');
    } finally {
      setIsGeneratingSample(false);
    }
  };

  const handleResetDemoData = async () => {
    if (window.confirm('Перезагрузить 8 демонстрационных запросов с ИИ-конспектами?')) {
      try {
        setIsSeeding(true);
        const res = await api.seedSamples(true);
        showToast(res.message, 'success');
        loadData();
      } catch (err) {
        showToast('Ошибка перезагрузки данных: ' + err.message, 'error');
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const managersList = ['Иван Петров', 'Екатерина Смирнова', 'Алексей Ковалев', 'Мария Новикова'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-rose-900/90 border-rose-500 text-rose-100'
              : toast.type === 'info'
              ? 'bg-sky-900/90 border-sky-500 text-sky-100'
              : 'bg-emerald-900/90 border-emerald-500 text-emerald-100'
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        stats={stats}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onFetchImap={handleFetchImap}
        onGenerateSample={handleGenerateSample}
        isFetchingImap={isFetchingImap}
        isGeneratingSample={isGeneratingSample}
        isLiveConnected={isLiveConnected}
      />

      {/* Filter Bar (for Kanban, Table, Cards) */}
      {viewMode !== 'analytics' && (
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          managers={managersList}
          onResetDemoData={handleResetDemoData}
          isSeeding={isSeeding}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {loading && requests.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Загрузка данных и ИИ-аналитики...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-400 text-xs">
            Ошибка: {error}
          </div>
        ) : (
          <>
            {viewMode === 'kanban' && (
              <KanbanView
                requests={requests}
                onSelectRequest={(req) => setSelectedRequestId(req.id)}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {viewMode === 'table' && (
              <TableView
                requests={requests}
                onSelectRequest={(req) => setSelectedRequestId(req.id)}
                onUpdateStatus={handleUpdateStatus}
                onBatchUpdateStatus={handleBatchUpdateStatus}
                onBatchDelete={handleBatchDelete}
              />
            )}

            {viewMode === 'cards' && (
              <CardFeedView
                requests={requests}
                onSelectRequest={(req) => setSelectedRequestId(req.id)}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {viewMode === 'analytics' && (
              <AnalyticsView />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {selectedRequestId && (
        <RequestDetailModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onUpdated={() => loadData()}
          onDeleted={() => {
            setSelectedRequestId(null);
            loadData();
          }}
          managers={managersList}
        />
      )}

      {isNewModalOpen && (
        <NewRequestModal
          onClose={() => setIsNewModalOpen(false)}
          onCreated={(newRec) => {
            loadData();
            showToast('Новый запрос успешно создан и проанализирован ИИ!', 'success');
            setSelectedRequestId(newRec.id);
          }}
        />
      )}

      {isUploadModalOpen && (
        <UploadEmlModal
          onClose={() => setIsUploadModalOpen(false)}
          onUploaded={(newRec) => {
            loadData();
            showToast('Файл .eml успешно обработан!', 'success');
            setSelectedRequestId(newRec.id);
          }}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          onSaved={() => {
            showToast('Настройки сохранены', 'success');
            loadData();
          }}
        />
      )}

    </div>
  );
}

export default App;
