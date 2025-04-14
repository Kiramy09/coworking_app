from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (CoworkingSpaceViewSet,UserViewSet,BookingViewSet,CoworkingPaymentViewSet,RegisterView,CoworkingSpaceListCreateView)
from .views import get_user_bookings, cancel_booking
from . import views

router = DefaultRouter()
router.register(r'spaces', CoworkingSpaceViewSet, basename='spaces')
router.register(r'users', UserViewSet)
router.register(r'bookings', BookingViewSet, basename='bookings')
router.register(r'payments', CoworkingPaymentViewSet, basename='payments')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/bookings/', get_user_bookings, name='get_user_bookings'),
    path('api/bookings/<int:id>/', cancel_booking, name='cancel_booking'),
     path('api/spaces/', CoworkingSpaceListCreateView.as_view(), name='space-list-create'),
    path('api/', include(router.urls)),
    path('', include(router.urls)),
]
