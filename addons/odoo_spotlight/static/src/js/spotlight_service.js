/** @odoo-module **/

import { registry } from "@web/core/registry";

export const spotlightSectionsRegistry =
  registry.category("spotlight_sections");

export const spotlightProviderService = {
  name: "spotlight_provider",
  dependencies: ["orm", "action"],

  async start(env, { orm, action }) {
    const definitions = registry.category("spotlight_sections").getAll();

    async function loadProviders() {
      const models = definitions.map((p) => p.model).filter(Boolean);

      const accessMap = await orm.call(
        "spotlight.access",
        "check_model_access_multi",
        [models]
      );

      return definitions
        .filter((p) => !p.model || accessMap[p.model])
        .sort((a, b) => (a.priority || 100) - (b.priority || 100))
        .map((def) => createRuntimeProvider(def));
    }

    function createRuntimeProvider(def) {
      return {
        id: def.id,
        label: def.label,
        icon: def.icon,
        ItemContentTemplate: def.ItemContentTemplate,

        async search(query, limit) {
          if (!query || query.length < 2) {
            return [];
          }

          const records = await orm.searchRead(
            def.model,
            def.domain(query),
            def.fields,
            { limit }
          );

          return Promise.all(
            records.map(async (record) => {
              const sereliazedRecord = await def.serialize(record, env);
              return {
                __provider: def.ItemContentTemplate,
                __index: null,
                ...sereliazedRecord,
                action: (opts) =>
                  def.action(action.doAction, record.id, def.model, opts),
              };
            })
          );
        },
      };
    }

    return {
      loadProviders,
    };
  },
};

registry.category("services").add("spotlight", spotlightProviderService);
