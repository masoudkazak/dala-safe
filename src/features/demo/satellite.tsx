import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { FeatureState } from '../../domain/types';
import { useDemoTranslation } from './demoI18n';
import { Badge, Button, Card, InputField, SelectField } from '../../ui';
import { DemoFrame } from './DemoFrame';

export const SATELLITE_STATE: FeatureState = 'requires-integration';

interface MeshNode {
  id: string;
  labelKey: string;
  x: number;
  y: number;
}

export const MESH_NODES: MeshNode[] = [
  { id: 'you', labelKey: 'demo.satellite.node.you', x: 40, y: 110 },
  { id: 'relay-a', labelKey: 'demo.satellite.node.relayA', x: 130, y: 50 },
  { id: 'relay-b', labelKey: 'demo.satellite.node.relayB', x: 130, y: 170 },
  { id: 'relay-c', labelKey: 'demo.satellite.node.relayC', x: 220, y: 110 },
];

const MESH_EDGES: Array<[string, string]> = [
  ['you', 'relay-a'],
  ['you', 'relay-b'],
  ['relay-a', 'relay-c'],
  ['relay-b', 'relay-c'],
];

export const SATELLITE_ROADMAP = [
  { id: 'eqonaq', titleKey: 'demo.satellite.roadmap.eqonaq.title', bodyKey: 'demo.satellite.roadmap.eqonaq.body' },
  { id: 'hydromet', titleKey: 'demo.satellite.roadmap.hydromet.title', bodyKey: 'demo.satellite.roadmap.hydromet.body' },
  { id: 'rescue', titleKey: 'demo.satellite.roadmap.rescue.title', bodyKey: 'demo.satellite.roadmap.rescue.body' },
  { id: 'satellite', titleKey: 'demo.satellite.roadmap.satellite.title', bodyKey: 'demo.satellite.roadmap.satellite.body' },
] as const;

interface QueueEntry {
  id: number;
  text: string;
  addedAt: string;
}

function nodeById(id: string): MeshNode {
  return MESH_NODES.find((node) => node.id === id) ?? MESH_NODES[0];
}

function formatClock(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

export function SatelliteDemo() {
  const t = useDemoTranslation();
  const [relayId, setRelayId] = useState<string>('relay-a');
  const [draftText, setDraftText] = useState<string>(t('demo.satellite.queue.sampleText'));
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [nextId, setNextId] = useState(1);

  const relay = nodeById(relayId);
  const pathLabels = [t('demo.satellite.node.you'), t(relay.labelKey), t('demo.satellite.node.relayC')].join(' → ');

  const handleRelayChange = (event: ChangeEvent<HTMLSelectElement>) => setRelayId(event.target.value);

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draftText.trim();
    if (!text) return;
    setQueue((previous) => [...previous, { id: nextId, text, addedAt: formatClock(new Date()) }]);
    setNextId(nextId + 1);
  };

  const handleClear = () => setQueue([]);

  return (
    <DemoFrame state={SATELLITE_STATE}>
      <div className="alert alert--warning" role="status">
        <strong>{t('demo.satellite.banner.title')}</strong>
        <p style={{ margin: '4px 0 0' }}>{t('demo.satellite.banner.body')}</p>
      </div>

      <Card title={t('demo.satellite.mesh.title')}>
        <p className="card__body">{t('demo.satellite.meshNote')}</p>

        <SelectField
          id="demo-satellite-relay"
          label={t('demo.satellite.selectNode')}
          value={relayId}
          onChange={handleRelayChange}
        >
          {MESH_NODES.filter((node) => node.id !== 'you' && node.id !== 'relay-c').map((node) => (
            <option key={node.id} value={node.id}>
              {t(node.labelKey)}
            </option>
          ))}
        </SelectField>

        <svg
          viewBox="0 0 260 220"
          role="img"
          aria-label={t('demo.satellite.mesh.alt', { path: pathLabels })}
          style={{ width: '100%', maxWidth: 360, height: 'auto' }}
        >
          {MESH_EDGES.map(([from, to]) => {
            const a = nodeById(from);
            const b = nodeById(to);
            const active =
              (from === 'you' && to === relayId) || (from === relayId && to === 'relay-c');
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={active ? 'var(--color-primary)' : 'var(--color-line-strong)'}
                strokeWidth={active ? 3 : 1.5}
                strokeDasharray={active ? undefined : '4 4'}
              />
            );
          })}
          {MESH_NODES.map((node) => {
            const isOnPath = node.id === 'you' || node.id === 'relay-c' || node.id === relayId;
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={16}
                  fill={isOnPath ? 'var(--color-primary)' : 'var(--color-surface-muted)'}
                  stroke="var(--color-line-strong)"
                />
                <text
                  x={node.x}
                  y={node.y + 34}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--color-ink-soft)"
                >
                  {t(node.labelKey)}
                </text>
              </g>
            );
          })}
        </svg>

        <p className="small" aria-live="polite" style={{ marginBottom: 0 }}>
          {t('demo.satellite.path', { path: pathLabels })}
        </p>
        <p className="tiny muted" style={{ marginBottom: 0 }}>
          {t('demo.satellite.pathNote')}
        </p>
      </Card>

      <Card title={t('demo.satellite.queue.title')}>
        <p className="card__body">{t('demo.satellite.queueNote')}</p>

        <form onSubmit={handleAdd} className="stack stack--tight" style={{ marginTop: 12 }}>
          <InputField
            id="demo-satellite-queue-text"
            label={t('demo.satellite.queue.label')}
            hint={t('demo.satellite.queue.hint')}
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            autoComplete="off"
          />
          <div className="cluster">
            <Button type="submit" variant="primary" disabled={draftText.trim().length === 0}>
              {t('demo.satellite.queue.add')}
            </Button>
            <Button type="button" variant="secondary" onClick={handleClear} disabled={queue.length === 0}>
              {t('demo.satellite.queue.clear')}
            </Button>
          </div>
        </form>

        <p className="small muted" aria-live="polite" style={{ marginTop: 12, marginBottom: 8 }}>
          {t('demo.satellite.queue.count', { count: queue.length })}
        </p>

        {queue.length === 0 ? (
          <p className="card__body" style={{ margin: 0 }}>
            {t('demo.satellite.queue.empty')}
          </p>
        ) : (
          <ul className="list-reset stack stack--tight">
            {queue.map((entry) => (
              <li key={entry.id} className="card card--flat">
                <div className="cluster" style={{ justifyContent: 'space-between' }}>
                  <span className="small" style={{ fontWeight: 600 }}>
                    {entry.text}
                  </span>
                  <Badge tone="info">{t('state.sampleData')}</Badge>
                </div>
                <p className="tiny muted" style={{ margin: '6px 0 0' }}>
                  {t('demo.satellite.queue.entry', { time: entry.addedAt })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={t('demo.satellite.roadmap.title')}>
        <p className="small muted" style={{ marginTop: 0 }}>
          {t('demo.satellite.roadmapNote')}
        </p>
        <ul className="list-reset stack stack--tight">
          {SATELLITE_ROADMAP.map((item) => (
            <li key={item.id} className="card card--flat">
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{t(item.titleKey)}</h3>
              <p className="small" style={{ margin: '6px 0 8px' }}>
                {t(item.bodyKey)}
              </p>
              <Badge tone="warning">{t('demo.satellite.roadmap.requires')}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </DemoFrame>
  );
}
