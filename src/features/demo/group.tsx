import { useState } from 'react';
import type { FeatureState } from '../../domain/types';
import { useDemoTranslation } from './demoI18n';
import { Badge, Button, Card, type BadgeTone } from '../../ui';
import { DemoFrame } from './DemoFrame';

export const GROUP_STATE: FeatureState = 'requires-integration';

const STATUS_ORDER = ['planning', 'in-transit', 'checked-in', 'overdue'] as const;
export type MemberStatus = (typeof STATUS_ORDER)[number];

const STATUS_TONE: Record<MemberStatus, BadgeTone> = {
  planning: 'neutral',
  'in-transit': 'info',
  'checked-in': 'success',
  overdue: 'danger',
};

const STATUS_LABEL: Record<MemberStatus, string> = {
  planning: 'demo.group.status.planning',
  'in-transit': 'demo.group.status.inTransit',
  'checked-in': 'demo.group.status.checkedIn',
  overdue: 'demo.group.status.overdue',
};

interface SampleMember {
  id: string;
  nameKey: string;
}

export const SAMPLE_MEMBERS: SampleMember[] = [
  { id: 'aigul', nameKey: 'demo.group.member.aigul' },
  { id: 'serik', nameKey: 'demo.group.member.serik' },
  { id: 'dana', nameKey: 'demo.group.member.dana' },
  { id: 'timur', nameKey: 'demo.group.member.timur' },
];

function initialStatuses(): Record<string, MemberStatus> {
  return Object.fromEntries(SAMPLE_MEMBERS.map((member) => [member.id, 'planning' as MemberStatus]));
}

function nextStatus(status: MemberStatus): MemberStatus {
  const index = STATUS_ORDER.indexOf(status);
  return STATUS_ORDER[(index + 1) % STATUS_ORDER.length];
}

export function GroupDemo() {
  const t = useDemoTranslation();
  const [statuses, setStatuses] = useState<Record<string, MemberStatus>>(initialStatuses);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const advanceOne = (member: SampleMember) => {
    const next = nextStatus(statuses[member.id]);
    setStatuses({ ...statuses, [member.id]: next });
    setLastUpdate(t('demo.group.updated', { name: t(member.nameKey), status: t(STATUS_LABEL[next]) }));
  };

  const advanceAll = () => {
    const next: Record<string, MemberStatus> = {};
    for (const member of SAMPLE_MEMBERS) {
      next[member.id] = nextStatus(statuses[member.id]);
    }
    setStatuses(next);
    setLastUpdate(t('demo.group.updatedAll'));
  };

  const resetAll = () => {
    setStatuses(initialStatuses());
    setLastUpdate(t('demo.group.resetDone'));
  };

  return (
    <DemoFrame state={GROUP_STATE}>
      <div className="alert alert--info" role="status">
        <strong>{t('demo.group.simulated.title')}</strong>
        <p style={{ margin: '4px 0 0' }}>{t('demo.group.simulated.body')}</p>
      </div>

      <Card title={t('demo.group.title')}>
        <p className="card__body">{t('demo.group.lead')}</p>

        <div className="cluster" style={{ margin: '12px 0' }}>
          <Button variant="primary" onClick={advanceAll}>
            {t('demo.group.advanceAll')}
          </Button>
          <Button variant="secondary" onClick={resetAll}>
            {t('demo.group.reset')}
          </Button>
        </div>

        <p className="small" role="status" aria-live="polite" style={{ minHeight: '1.5em' }}>
          {lastUpdate ?? t('demo.group.idle')}
        </p>

        <ul className="list-reset stack stack--tight">
          {SAMPLE_MEMBERS.map((member) => {
            const status = statuses[member.id];
            return (
              <li key={member.id} className="card card--flat">
                <div className="cluster" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{t(member.nameKey)}</h3>
                  <Badge tone={STATUS_TONE[status]}>{t(STATUS_LABEL[status])}</Badge>
                </div>
                <p className="tiny muted" style={{ margin: '6px 0 8px' }}>
                  {t('demo.group.memberSampleNote')}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => advanceOne(member)}
                  aria-label={`${t('demo.group.advanceOne')} — ${t(member.nameKey)}`}
                >
                  {t('demo.group.advanceOne')}
                </Button>
              </li>
            );
          })}
        </ul>
      </Card>
    </DemoFrame>
  );
}
