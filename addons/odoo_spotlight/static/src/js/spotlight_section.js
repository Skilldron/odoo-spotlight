import { Component } from "@odoo/owl";

/**
 * @typedef {{
 *  title: string;
 *  subtitle: string;
 *  action: ;
 * }} ItemData
 */

export class SpotlightSection extends Component {
  static template = "odoo_spotlight.SpotlightSection";
  static props = {
    title: String,
    icon: String,
    items: Array,
  };
}
