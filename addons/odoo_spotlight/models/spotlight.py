from odoo import models, api

class ResPartner(models.Model):
    _inherit = 'res.partner'

    @api.model
    def spotlight_search(self, query, limit=10):
        if not query:
            return []

        sql_query = '''
            SELECT id, ts_rank(
                to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(email,'')),
                plainto_tsquery(%s)
            ) AS rank
            FROM res_partner
            WHERE to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(email,'')) @@ plainto_tsquery(%s)
            ORDER BY rank DESC
            LIMIT %s;
        '''
        self.env.cr.execute(sql_query, (query, query, limit))
        ids = [row[0] for row in self.env.cr.fetchall()]
        return self.browse(ids).read(['id', 'display_name', 'email'])
