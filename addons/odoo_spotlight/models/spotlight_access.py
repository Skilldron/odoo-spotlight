from odoo import models, api
import logging


_logger = logging.getLogger(__name__)


class SpotlightAccess(models.AbstractModel):
    _name = "spotlight.access"
    _description = "Spotlight access checker"

    @api.model
    def check_model_access_multi(self, models: list[str]) -> dict[str, bool]:
        """Check read access on a list of models.

        This is used to filter out providers the user cannot access at all.
        """
        result: dict[str, bool] = {}
        for model in models:
            try:
                self.env[model].check_access_rights("read")
                result[model] = True
            except Exception:
                result[model] = False
        return result

    @api.model
    def check_model_access(self, model_name: str):
        """Backward-compatible single model check."""
        try:
            self.env[model_name].check_access_rights("read")
            _logger.debug("Access to model %s: granted", model_name)
            return True
        except Exception:
            _logger.debug("Access to model %s: denied", model_name)
            return False

    # -------------------------------------------------------------------------
    # Quick actions helpers
    # -------------------------------------------------------------------------

    @api.model
    def get_quick_actions_for_models(self, models: list[str]) -> dict[str, dict]:
        """Return which common quick actions are available for each model.

        The goal is to expose only actions that make sense and that the user
        has at least the technical rights for. More functional constraints
        (such as record state) are still enforced at execution time.
        """
        result: dict[str, dict] = {}
        for model_name in models:
            info = {"delete": False, "archive": False}
            try:
                model = self.env[model_name]
            except Exception:
                result[model_name] = info
                continue

            # Delete is allowed if the user can unlink.
            try:
                model.check_access_rights("unlink")
                info["delete"] = True
            except Exception:
                info["delete"] = False

            # Archive is allowed if the user can write and the model is
            # archived via an `active` field (classic Odoo semantics).
            try:
                model.check_access_rights("write")
                if "active" in model._fields:
                    info["archive"] = True
            except Exception:
                info["archive"] = False

            result[model_name] = info
        return result

