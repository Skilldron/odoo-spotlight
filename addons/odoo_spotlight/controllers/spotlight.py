from odoo import http
from odoo.http import request

class SpotlightController(http.Controller):

    @http.route('/spotlight/search', type='json', auth='user')
    def spotlight_search(self, query, limit=10):
        partners = request.env['res.partner'].sudo().spotlight_search(query, limit=limit)
        return {'res.partner': partners}
