// Price estimates for the site assistant. Deterministic on purpose: the model
// only picks a service and a size, so it can't invent hours or a rate.
import { ESTIMATE_SIZES, estimateRubric, type EstimateSize } from '../data/assistant';
import { services, HOURLY_RATE_DKK } from '../data/services';

const isSize = (s: unknown): s is EstimateSize => ESTIMATE_SIZES.includes(s as EstimateSize);

/** A ballpark for one service at one size, or an error the model can read and correct. */
export function estimate(args: Record<string, unknown>) {
  const service = services.find((s) => s.id === args.service);
  const rubric = estimateRubric[String(args.service)];
  if (!service || !rubric) return { error: `Unknown service "${String(args.service)}"` };
  if (!isSize(args.size)) return { error: `Unknown size "${String(args.size)}"; use ${ESTIMATE_SIZES.join(', ')}` };
  const [low, high] = rubric.hours[args.size];
  return {
    service: service.title.en,
    size: args.size,
    hours: { low, high },
    dkk: { low: low * HOURLY_RATE_DKK, high: high * HOURLY_RATE_DKK },
    hourlyRateDkk: HOURLY_RATE_DKK,
    vatIncluded: false,
    binding: false,
    sizeDrivers: rubric.drivers,
  };
}
