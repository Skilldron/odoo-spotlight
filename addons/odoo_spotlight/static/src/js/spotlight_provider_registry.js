/** @odoo-module **/

import { registry } from "@web/core/registry";

/**
 * Each provider must expose:
 * - section (string)
 * - icon (string)
 * - priority (number)
 * - search(env, query) => Promise<SpotlightItem[]>
 */
export const spotlightProviderRegistry =
  registry.category("spotlight_provider");
