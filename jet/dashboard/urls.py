from django.conf.urls import url
from django.views.i18n import JavaScriptCatalog

from jet.dashboard import dashboard
from jet.dashboard.views import (
    update_dashboard_modules_view,
    add_user_dashboard_module_view,
    update_dashboard_module_collapse_view,
    remove_dashboard_module_view,
    UpdateDashboardModuleView,
    load_dashboard_module_view,
    reset_dashboard_view
)

app_name = 'dashboard'

js_info_dict = {
    'packages': ('jet',),
}

urlpatterns = [
    url(
        r'^module/(?P<pk>\d+)/$',
        UpdateDashboardModuleView.as_view(),
        name='update_module'
    ),
    url(
        r'^update_dashboard_modules/$',
        update_dashboard_modules_view,
        name='update_dashboard_modules'
    ),
    url(
        r'^add_user_dashboard_module/$',
        add_user_dashboard_module_view,
        name='add_user_dashboard_module'
    ),
    url(
        r'^update_dashboard_module_collapse/$',
        update_dashboard_module_collapse_view,
        name='update_dashboard_module_collapse'
    ),
    url(
        r'^remove_dashboard_module/$',
        remove_dashboard_module_view,
        name='remove_dashboard_module'
    ),
    url(
        r'^load_dashboard_module/(?P<pk>\d+)/$',
        load_dashboard_module_view,
        name='load_dashboard_module'
    ),
    url(
        r'^reset_dashboard/$',
        reset_dashboard_view,
        name='reset_dashboard'
    ),
    url(
        r'^jsi18n/$',
        JavaScriptCatalog.as_view(),
        js_info_dict,
        name='jsi18n'
    ),
]

urlpatterns += dashboard.urls.get_urls()
