import { useState } from 'react';
import type { FeatureState } from '../../domain/types';
import { useDemoTranslation } from './demoI18n';
import { Badge, Button, Card } from '../../ui';
import { DemoFrame } from './DemoFrame';

export const LEARNING_STATE: FeatureState = 'demo';

interface SampleLesson {
  id: string;
  titleKey: string;
  bodyKey: string;
}

export const SAMPLE_LESSONS: SampleLesson[] = [
  { id: 'hypothermia', titleKey: 'demo.learning.lesson.hypothermia.title', bodyKey: 'demo.learning.lesson.hypothermia.body' },
  { id: 'bleeding', titleKey: 'demo.learning.lesson.bleeding.title', bodyKey: 'demo.learning.lesson.bleeding.body' },
  { id: 'navigation', titleKey: 'demo.learning.lesson.navigation.title', bodyKey: 'demo.learning.lesson.navigation.body' },
];

export function LearningDemo() {
  const t = useDemoTranslation();
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});

  const doneCount = SAMPLE_LESSONS.filter((lesson) => reviewed[lesson.id]).length;

  const toggle = (id: string) => {
    setReviewed((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  return (
    <DemoFrame state={LEARNING_STATE}>
      <div className="alert alert--warning" role="note">
        <strong>{t('demo.learning.expertNote.title')}</strong>
        <p style={{ margin: '4px 0 0' }}>{t('demo.learning.expertNote.body')}</p>
      </div>

      <Card title={t('demo.learning.title')}>
        <p className="card__body">{t('demo.learning.lead')}</p>

        <div className="cluster" style={{ margin: '12px 0' }}>
          <Badge tone="info">{t('state.sampleData')}</Badge>
          <span className="small muted" role="status" aria-live="polite">
            {t('demo.learning.progress', { done: doneCount, total: SAMPLE_LESSONS.length })}
          </span>
        </div>

        <ul className="list-reset stack stack--tight">
          {SAMPLE_LESSONS.map((lesson) => {
            const isReviewed = Boolean(reviewed[lesson.id]);
            return (
              <li key={lesson.id}>
                <div className={`checkbox-row ${isReviewed ? 'checkbox-row--done' : ''}`}>
                  <input
                    type="checkbox"
                    id={`demo-lesson-${lesson.id}`}
                    checked={isReviewed}
                    onChange={() => toggle(lesson.id)}
                  />
                  <div className="checkbox-row__body">
                    <label className="checkbox-row__label" htmlFor={`demo-lesson-${lesson.id}`}>
                      {t(lesson.titleKey)}
                      <Badge tone={isReviewed ? 'success' : 'neutral'}>
                        {t(isReviewed ? 'demo.learning.reviewed' : 'demo.learning.notReviewed')}
                      </Badge>
                    </label>
                    <p className="small" style={{ margin: '6px 0 0' }}>
                      {t(lesson.bodyKey)}
                    </p>
                    <p className="tiny muted" style={{ margin: '6px 0 0' }}>
                      {t('demo.learning.outlineNote')}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="cluster" style={{ marginTop: 12 }}>
          <Button variant="secondary" size="sm" onClick={() => setReviewed({})}>
            {t('demo.learning.clear')}
          </Button>
        </div>
      </Card>
    </DemoFrame>
  );
}
