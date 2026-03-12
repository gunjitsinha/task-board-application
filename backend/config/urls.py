from django.urls import path, include
from django.contrib.auth.models import User
from rest_framework import routers
from tasks.views import TaskViewSet

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r"tasks", TaskViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path("", include(router.urls)),
    path("/", include("rest_framework.urls", namespace="rest_framework")),
]