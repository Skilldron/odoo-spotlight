/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { spotlightSectionsRegistry } from "../spotlight_service";
import { CheckBox } from "@web/core/checkbox/checkbox";

export class SpotlightProviderSelector extends Component {
  static template = "odoo_spotlight.SpotlightProviderSelector";
  static components = { CheckBox };

  setup() {
    this.providers = spotlightSectionsRegistry.getAll();
    this.disabledProvidersRecordData =
      this.props.record.data[this.props.name] || [];
    this.providersStates = useState(
      this.providers.map((provider) => ({
        id: provider.id,
        label: provider.label,
        icon: provider.icon,
        activated: !this.disabledProvidersRecordData.includes(provider.id),
      }))
    );
  }

  onChange(providerId, checkedValue) {
    this.providersStates.find((provider) => provider.id == providerId).activated = checkedValue;
    this.commitChanges();
  }

  commitChanges() {
    this.props.record.update({
      [this.props.name]: this.providersStates
        .filter((provider) => !provider.activated)
        .map((provider) => provider.id),
    });
  }
}

registry.category("fields").add("spotlight_provider_selector", {
  component: SpotlightProviderSelector,
  supportedTypes: ["json"],
});
