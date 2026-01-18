from odoo import fields, models, api


class ResUsers(models.Model):
    _inherit = "res.users"

    spotlight_limit = fields.Integer(string="Spotlight result limit", default=5)
    spotlight_disabled_providers = fields.Json(
        string="Spotlight Providers",
        description="List spotlight providers allowing to be disabled by the user",
        default=lambda r : []
    )

    @api.model
    def get_spotlight_user_settings(self, uid=None):
        user = self.browse(uid or self.env.uid)
        return {
            "spotlight_limit": user.spotlight_limit,
            "spotlight_disabled_providers": user.spotlight_disabled_providers or [],
        }