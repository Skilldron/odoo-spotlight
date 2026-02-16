/** @odoo-module **/

import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";

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

    // Map of model -> { delete: boolean, archive: boolean }
    let quickActionsByModel = {};

    function buildCommonQuickActions(model, record) {
      const config = quickActionsByModel[model] || {};
      const actions = [];

      if (config.delete) {
        actions.push({
          id: "delete",
          label: _t("Delete"),
          icon: "fa-trash",
          isDestructive: true,
          isCommon: true,
          async execute() {
            await orm.call(model, "unlink", [[record.id]]);
          },
        });
      }

      if (config.archive) {
        actions.push({
          id: "archive",
          label: _t("Archive"),
          icon: "fa-archive",
          isDestructive: false,
          isCommon: true,
          async execute() {
            await orm.call(model, "action_archive", [[record.id]]);
          },
        });
      }

      return actions;
    }

    async function loadProviders() {
      const disabledProviders = userSettings.spotlight_disabled_providers || [];
      const models = definitions.map((p) => p.model).filter(Boolean);

      const [accessMap, quickActionsInfo] = await Promise.all([
        orm.call("spotlight.access", "check_model_access_multi", [models]),
        orm.call("spotlight.access", "get_quick_actions_for_models", [models]),
      ]);

      quickActionsByModel = quickActionsInfo || {};

      return definitions
        .filter(
          (p) =>
            !p.model ||
            (accessMap[p.model] && !disabledProviders.includes(p.id)),
        )
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
            { limit: userSettings.spotlight_limit || 5 },
          );

          return Promise.all(
            records.map(async (record) => {
              const serializedRecord = await def.serialize(record, env);
              const commonQuickActions = buildCommonQuickActions(
                def.model,
                record,
              );

              let providerQuickActions = [];
              if (def.getQuickActions) {
                providerQuickActions =
                  def.getQuickActions({
                    env,
                    record,
                    model: def.model,
                    doAction: action.doAction,
                  }) || [];
              }

              const quickActions = {
                provider: providerQuickActions || [],
                common: commonQuickActions || [],
              };

              return {
                __provider: def.ItemContentTemplate,
                __index: null,
                ...serializedRecord,
                quickActions,
                action: (opts) =>
                  def.action(action.doAction, record.id, def.model, opts),
              };
            }),
          );
        },
      };
    }

    return {
      loadProviders,
      userSettings,
    };
  },
};

registry.category("services").add("spotlight", spotlightProviderService);
