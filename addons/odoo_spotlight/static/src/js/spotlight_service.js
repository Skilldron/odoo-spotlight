/** @odoo-module **/

import { registry } from "@web/core/registry";

export const spotlightSectionsRegistry =
  registry.category("spotlight_sections");

export const spotlightProviderService = {
  name: "spotlight_provider",
  dependencies: ["orm", "action"],

  async start(env, { orm, action }) {
    async function getCurrentUserSettings() {
      return await orm.call("res.users", "get_spotlight_user_settings", [[]]);
    }

    const definitions = registry.category("spotlight_sections").getAll();
    const userSettings = await getCurrentUserSettings();

    async function loadProviders() {
      const disabledProviders = userSettings.spotlight_disabled_providers || [];
      const models = definitions.map((p) => p.model).filter(Boolean);

      const accessMap = await orm.call(
        "spotlight.access",
        "check_model_access_multi",
        [models]
      );

      return definitions
        .filter((p) => !p.model || accessMap[p.model] && !disabledProviders.includes(p.id))
        .sort((a, b) => (a.priority || 100) - (b.priority || 100))
        .map((def) => createRuntimeProvider(def));
    }

    function createRuntimeProvider(def) {
      return {
        id: def.id,
        label: def.label,
        icon: def.icon,
        ItemContentTemplate: def.ItemContentTemplate,

        async search(query) {
          if (!query || query.length < 2) {
            return [];
          }

          const records = await orm.searchRead(
            def.model,
            def.domain(query),
            def.fields,
            { limit: userSettings.spotlight_limit || 5 }
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
      userSettings
    };
  },
};

registry.category("services").add("spotlight", spotlightProviderService);
