import { useState } from 'react';

import { demoForecast, PLAN_B_RAIN_CHANCE } from '@nowish/demo';
import { setPlanB, togglePlanB, type DayKey } from '@nowish/domain';
import { Button, Card, SectionTitle, SwitchRow, Text, TextField } from '@nowish/ui';

import { useCollab } from '../collab/use-collab';

/**
 * Weather and plan B (Phase 6, simulated): a clearly labelled demo forecast and the host's fallback place.
 * Switching to plan B posts a note in the event chat so everyone knows.
 */
export function PlanBCard({ eventId, day }: { eventId: string; day: DayKey }) {
  const ctx = useCollab(eventId);
  const { collab, event, t, now, isHost, viewerId, run, name, store } = ctx;
  const [location, setLocation] = useState(collab?.planB?.location ?? '');
  const [saved, setSaved] = useState(false);
  if (!collab || !event) return null;
  if (!collab.outdoor && !isHost) return null;
  const forecast = collab.outdoor ? demoForecast(event.id, day, now, store.timeZone) : null;
  const plan = collab.planB;

  return (
    <Card testID="plan-b">
      <SectionTitle>{t('weather.title')}</SectionTitle>
      {collab.outdoor ? (
        forecast ? (
          <>
            <Text variant="titleM" testID="weather-line">
              {t('weather.line', {
                kind: t(`weather.kind.${forecast.kind}`),
                temp: forecast.tempC,
                chance: forecast.rainChance,
              })}
            </Text>
            <Text variant="label" color="textSecondary">
              {t('weather.demo')}
            </Text>
            {forecast.rainChance >= PLAN_B_RAIN_CHANCE && !plan?.active ? (
              <Text variant="bodyM" testID="plan-b-suggest">
                {t('planb.suggest')}
              </Text>
            ) : null}
          </>
        ) : (
          <Text variant="bodyM" color="textSecondary">
            {t('weather.later')}
          </Text>
        )
      ) : null}

      <SectionTitle>{t('planb.title')}</SectionTitle>
      {plan?.active ? (
        <Text variant="titleM" testID="plan-b-active">
          {t('planb.active', { location: plan.location })}
        </Text>
      ) : plan ? (
        <Text variant="bodyM">{t('planb.ready', { location: plan.location })}</Text>
      ) : (
        <Text variant="bodyM" color="textSecondary">
          {t('planb.none')}
        </Text>
      )}

      {isHost ? (
        <>
          {plan ? (
            <Button
              label={plan.active ? t('planb.deactivate') : t('planb.activate')}
              variant={plan.active ? 'tertiary' : 'primary'}
              onPress={() => void run((c, at) => togglePlanB(c, viewerId, at), 'success')}
              testID="plan-b-toggle"
            />
          ) : null}
          <SwitchRow
            label={t('planb.outdoor')}
            value={collab.outdoor === true}
            onChange={(outdoor) =>
              void run((c) => setPlanB(c, viewerId, { outdoor, location: c.planB?.location ?? '' }))
            }
            testID="plan-b-outdoor"
          />
          <TextField
            label={t('planb.location')}
            value={location}
            onChangeText={(v) => {
              setLocation(v);
              setSaved(false);
            }}
            maxLength={200}
            testID="plan-b-location"
          />
          <Button
            label={saved ? t('planb.saved') : t('planb.save')}
            variant="secondary"
            onPress={() =>
              void run((c) => setPlanB(c, viewerId, { outdoor: c.outdoor === true, location })).then((ok) =>
                setSaved(ok),
              )
            }
            testID="plan-b-save"
          />
        </>
      ) : (
        <Text variant="label" color="textSecondary">
          {t('planb.byHost', { name: name(collab.hostId) })}
        </Text>
      )}
    </Card>
  );
}
