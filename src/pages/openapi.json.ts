import type { APIContext } from 'astro';
import { openApiSpec } from '../lib/api-catalog';

export const GET = ({ site }: APIContext) => Response.json(openApiSpec(site!));
