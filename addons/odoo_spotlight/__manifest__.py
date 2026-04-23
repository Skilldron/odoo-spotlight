{
    'name': "Odoo Spotlight",
    'version': '1.0',
    'depends': ['base', 'web'],
    'author': "Skilldron",
    'category': 'Extra Tools',
    'description': """
                Odoo Spotlight can be opened with Ctrl/Cmd+k and brings a quick search ability to your Odoo backend.
        Trigger it from anywhere with a keyboard
        shortcut, type a name, email, or
        reference, and instantly reach the record
        you need — no menu navigation required.

        Key features:
        - Real-time search across Contacts, Sales
        Orders, Invoices, custom models, and more
        - Keyboard-driven: ↑↓ to navigate, Enter
        to open, Shift+Enter to open in dialog
        - Quick actions per record (Send
        quotation, Confirm order, Archive,
        Delete, etc.)
            triggered with Ctrl/Cmd+; — only shown if
        you have the required access rights
        - Tab switches to Odoo's native command
        palette
        - Per-user preferences: result limit and
        provider toggle
        - Security-aware: providers are
        automatically hidden based on Odoo access
        rights
        - Developer-extensible: register custom
        providers and quick actions via the
        registry
    """,
    'price': 100,
    'currency': 'EUR',
    'data': ["views/res_user_view.xml"],
    "images": ["static/description/main_screen.jpg"],
    'assets': {
        'web.assets_backend': [
            'odoo_spotlight/static/src/**/*'

        ],
    },
    'installable': True,
    'application': True,
    'license': 'OPL-1'
}
