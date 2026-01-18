{
    'name': "Odoo Spotlight",
    'version': '1.0',
    'depends': ['base', 'web'],
    'author': "Skilldron",
    'category': 'Extra Tools',
    'description': """
        This simple module help you find what you're looking for 'in a blink of an eye' :D
    """,
    'data': ["views/res_user_view.xml"],
    'assets': {
        'web.assets_backend': [
            'odoo_spotlight/static/src/**/*'

        ],
    },
    'installable': True,
    'application': True,
    'license': 'OPL-1'
}
