import type { BookingRuleData } from '@jomeca/shared';
const notice = (minutes: number) =>
  minutes % 1440 === 0
    ? `${minutes / 1440} days`
    : minutes % 60 === 0
      ? `${minutes / 60} hours`
      : `${minutes} minutes`;
export function eventGuidance(rule?: BookingRuleData) {
  return [
    {
      title: 'Event duration',
      detail: rule
        ? `${rule.minMinutes / 60}–${rule.maxMinutes / 60} hours, in ${rule.stepMinutes}-minute increments.`
        : 'Confirm current duration limits with our team.',
    },
    {
      title: 'Advance planning',
      detail: rule
        ? `Plan up to ${rule.advanceDays !== null ? `${rule.advanceDays} days` : `${rule.advanceMonths} months`} ahead, with at least ${notice(rule.cutoffMinutes)} before the event. Exceptions require management review.`
        : 'Confirm the advance window and notice period with our team.',
    },
    {
      title: 'One shared venue',
      detail:
        'Gymnasium, events, active holds and venue blocks share the same space. Setup and teardown must also fit without overlap.',
    },
    {
      title: 'Confirmation',
      detail:
        'An enquiry or schedule check does not hold the venue. Staff must review arrangements, verify payment and approve the reservation before confirmation.',
    },
  ];
}
