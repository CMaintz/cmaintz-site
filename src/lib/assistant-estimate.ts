// Price estimates for the site assistant. Deterministic on purpose: the model
// only picks a service and a size, so it can't invent hours or a rate.
import { ESTIMATE_SIZES, estimateRubric, type EstimateSize } from '../data/assistant';
import { services, FOLLOW_UP_FROM_HOURS, FOLLOW_UP_HOURS, FOLLOW_UP_RANGE, HOURLY_RATE_DKK } from '../data/services';

const isSize = (s: unknown): s is EstimateSize => ESTIMATE_SIZES.includes(s as EstimateSize);
const withFollowUp = (hours: number, extra: number) => (hours >= FOLLOW_UP_FROM_HOURS ? hours + extra : hours);

/** The rubric's hour range with follow-up added, priced at the hourly rate. */
function priced([lo, hi]: [number, number]) {
  const low = withFollowUp(lo, FOLLOW_UP_HOURS[0]);
  const high = withFollowUp(hi, FOLLOW_UP_HOURS[1]);
  return {
    hours: { low, high },
    dkk: { low: low * HOURLY_RATE_DKK, high: high * HOURLY_RATE_DKK },
    followUpIncluded:
      high >= FOLLOW_UP_FROM_HOURS ? `${FOLLOW_UP_RANGE} hours after delivery, for questions and small fixes` : null,
  };
}

/** A ballpark for one service at one size, or an error the model can read and correct. */
export function estimate(args: Record<string, unknown>) {
  const service = services.find((s) => s.id === args.service);
  const rubric = estimateRubric[String(args.service)];
  if (!service || !rubric) return { error: `Unknown service "${String(args.service)}"` };
  if (!isSize(args.size)) return { error: `Unknown size "${String(args.size)}"; use ${ESTIMATE_SIZES.join(', ')}` };
  return {
    service: service.title.en,
    size: args.size,
    ...priced(rubric.hours[args.size]),
    hourlyRateDkk: HOURLY_RATE_DKK,
    vatIncluded: false,
    binding: false,
    sizeDrivers: rubric.drivers,
  };
}
