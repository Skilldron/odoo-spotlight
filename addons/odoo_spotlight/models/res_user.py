from odoo import fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    spotlight_limit = fields.Integer(string="Spotlight result limit", default=5)
    spotlight_disabled_providers = fields.Json(
        string="Disabled Spotlight Providers", default=list
    )
