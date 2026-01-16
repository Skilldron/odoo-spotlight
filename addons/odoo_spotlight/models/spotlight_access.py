from odoo import models, api
import logging


_logger = logging.getLogger(__name__)


class SpotlightAccess(models.AbstractModel):
    _name = "spotlight.access"
    _description = "Spotlight access checker"

    @api.model
    def check_model_access_multi(self, models: list[str]) -> dict[str, bool]:
        result = {}
        for model in models:
            try:
                self.env[model].check_access_rights("read")
                result[model] = True
            except Exception:
                result[model] = False
        return result

    @api.model
    def check_model_access(self, model_name: str):
        try:
            self.env[model_name].check_access_rights("read")
            _logger.debug("Access to model %s: granted", model_name)
            return True
        except Exception:
            _logger.debug("Access to model %s: denied", model_name)
            return False
