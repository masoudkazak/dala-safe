import { useState, type ChangeEvent } from 'react';
import { useI18n } from '../../i18n';
import { useTrips, type StorageProblem } from '../../data/TripsProvider';
import { Button, ButtonLink, Card, ConfirmDialog, DownloadIcon, PageHeader } from '../../ui';
import {
  clearStoredLocalData,
  downloadTripExport,
  mergeTripImports,
  readImportFile,
  TripImportError,
  MAX_IMPORT_BYTES,
} from './tripData';

type ImportFeedback =
  | { kind: 'success'; count: number; added: number; replaced: number }
  | { kind: 'empty' }
  | { kind: 'invalid' }
  | { kind: 'too-large' }
  | { kind: 'read-error' };

const STORAGE_PROBLEM_KEY: Record<Exclude<StorageProblem, null>, string> = {
  quota: 'error.storageQuota',
  unavailable: 'error.storageUnavailable',
  corrupted: 'error.storageCorrupted',
};

const STORAGE_PROBLEM_TONE: Record<Exclude<StorageProblem, null>, string> = {
  quota: 'alert alert--warning',
  unavailable: 'alert alert--danger',
  corrupted: 'alert alert--warning',
};

const MAX_IMPORT_MB = MAX_IMPORT_BYTES / (1024 * 1024);

export function DataManagementPage() {
  const { t } = useI18n();
  const tData = (key: string, vars?: Record<string, string | number>) => t(`data:${key}`, vars);
  const { trips, replaceAll, storageProblem } = useTrips();
  const [exportedCount, setExportedCount] = useState<number | null>(null);
  const [importFeedback, setImportFeedback] = useState<ImportFeedback | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteDone, setDeleteDone] = useState(false);

  const hasTrips = trips.length > 0;

  function handleExport() {
    if (!hasTrips) return;
    downloadTripExport(trips);
    setExportedCount(trips.length);
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    setImportFeedback(null);
    setImportBusy(true);
    setDeleteDone(false);

    try {
      const imported = await readImportFile(file);
      if (imported.length === 0) {
        setImportFeedback({ kind: 'empty' });
        return;
      }
      const merged = mergeTripImports(trips, imported);
      replaceAll(merged.trips);
      setExportedCount(null);
      setImportFeedback({
        kind: 'success',
        count: imported.length,
        added: merged.added,
        replaced: merged.replaced,
      });
    } catch (error) {
      if (error instanceof TripImportError) {
        setImportFeedback({ kind: error.code });
      } else {
        setImportFeedback({ kind: 'read-error' });
      }
    } finally {
      setImportBusy(false);
    }
  }

  function handleDeleteAll() {
    replaceAll([]);
    clearStoredLocalData();
    setDeleteOpen(false);
    setDeleteDone(true);
    setExportedCount(null);
    setImportFeedback(null);
  }

  return (
    <div className="stack">
      <PageHeader
        eyebrow={t('app.name')}
        title={tData('title')}
        lead={tData('subtitle')}
        actions={
          <ButtonLink to="/settings" variant="secondary">
            {tData('back')}
          </ButtonLink>
        }
      />

      {storageProblem ? (
        <p
          className={STORAGE_PROBLEM_TONE[storageProblem]}
          role="alert"
          data-testid="storage-problem"
        >
          {t(STORAGE_PROBLEM_KEY[storageProblem])}
        </p>
      ) : null}

      <Card title={tData('storage.title')}>
        <dl className="definition-list">
          <div>
            <dt>{tData('storage.countLabel')}</dt>
            <dd>{tData('storage.count', { count: trips.length })}</dd>
          </div>
          <div>
            <dt>{tData('storage.locationLabel')}</dt>
            <dd>{tData('storage.local')}</dd>
          </div>
          <div>
            <dt>{tData('storage.limitLabel')}</dt>
            <dd>{tData('storage.limit')}</dd>
          </div>
          <div>
            <dt>{tData('storage.backupLabel')}</dt>
            <dd>{tData('storage.backup')}</dd>
          </div>
          <div>
            <dt>{tData('storage.corruptLabel')}</dt>
            <dd>{tData('storage.corrupt')}</dd>
          </div>
          <div>
            <dt>{tData('storage.modelLabel')}</dt>
            <dd>{tData('storage.model')}</dd>
          </div>
        </dl>
      </Card>

      <Card title={tData('export.title')}>
        <p className="card__body">{tData('export.body')}</p>
        <p className="alert alert--warning" style={{ marginTop: '1rem' }}>
          {tData('export.privacy')}
        </p>
        <div className="cluster" style={{ marginTop: '1rem' }}>
          <Button onClick={handleExport} disabled={!hasTrips} icon={<DownloadIcon />}>
            {tData('export.button')}
          </Button>
        </div>
        {!hasTrips ? (
          <p className="small muted" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            {tData('export.empty')}
          </p>
        ) : null}
        {exportedCount !== null ? (
          <p className="alert alert--success" role="status" style={{ marginTop: '1rem' }}>
            {tData('export.done', { count: exportedCount })}
          </p>
        ) : null}
      </Card>

      <Card title={tData('import.title')}>
        <p className="card__body">{tData('import.body')}</p>
        <p className="small muted" style={{ marginTop: '0.5rem' }}>
          {tData('import.merge')}
        </p>

        <div className="field" style={{ marginTop: '1rem' }}>
          <label className="field__label" htmlFor="data-import-file">
            {tData('import.button')}
          </label>
          <input
            id="data-import-file"
            className="input"
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            disabled={importBusy}
            aria-describedby="data-import-limit"
          />
          <p className="field__hint" id="data-import-limit">
            {tData('import.limit', { size: MAX_IMPORT_MB })}
          </p>
        </div>

        {importBusy ? (
          <p className="small muted" role="status">
            {tData('import.busy')}
          </p>
        ) : null}

        {importFeedback?.kind === 'success' ? (
          <p className="alert alert--success" role="status" style={{ marginTop: '1rem' }}>
            {tData('import.done', {
              count: importFeedback.count,
              added: importFeedback.added,
              replaced: importFeedback.replaced,
            })}
          </p>
        ) : null}
        {importFeedback?.kind === 'empty' ? (
          <p className="alert alert--warning" role="status" style={{ marginTop: '1rem' }}>
            {tData('import.noTrips')}
          </p>
        ) : null}
        {importFeedback?.kind === 'invalid' ? (
          <p className="alert alert--danger" role="alert" style={{ marginTop: '1rem' }}>
            {tData('import.invalid')}
          </p>
        ) : null}
        {importFeedback?.kind === 'too-large' ? (
          <p className="alert alert--danger" role="alert" style={{ marginTop: '1rem' }}>
            {tData('import.tooLarge', { size: MAX_IMPORT_MB })}
          </p>
        ) : null}
        {importFeedback?.kind === 'read-error' ? (
          <p className="alert alert--danger" role="alert" style={{ marginTop: '1rem' }}>
            {tData('import.readError')}
          </p>
        ) : null}
      </Card>

      <Card title={tData('privacy.title')}>
        <p className="card__body">{tData('privacy.body')}</p>
      </Card>

      <Card title={tData('delete.title')}>
        <p className="card__body">{tData('delete.body')}</p>
        <p className="small muted" style={{ marginTop: '0.75rem' }}>
          {tData('delete.reloadNote')}
        </p>
        <div className="cluster" style={{ marginTop: '1rem' }}>
          <Button variant="danger-outline" onClick={() => setDeleteOpen(true)}>
            {tData('delete.button')}
          </Button>
          <Button variant="ghost" onClick={handleExport} disabled={!hasTrips} icon={<DownloadIcon />}>
            {tData('delete.exportFirst')}
          </Button>
        </div>
        {deleteDone ? (
          <p className="alert alert--success" role="status" style={{ marginTop: '1rem' }}>
            {tData('delete.done')}
          </p>
        ) : null}
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        title={tData('delete.confirmTitle')}
        body={
          <>
            <p>{tData('delete.confirmBody')}</p>
            <p>{tData('delete.exportFirstHint')}</p>
          </>
        }
        confirmLabel={tData('delete.confirmLabel')}
        onConfirm={handleDeleteAll}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
