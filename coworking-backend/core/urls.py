from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (CoworkingSpaceViewSet,UserViewSet,BookingViewSet,CoworkingPaymentViewSet,RegisterView)
from .views import get_all_bookings

router = DefaultRouter()
router.register(r'spaces', CoworkingSpaceViewSet, basename='spaces')
router.register(r'users', UserViewSet)
router.register(r'bookings', BookingViewSet, basename='bookings')
router.register(r'payments', CoworkingPaymentViewSet, basename='payments')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
     path('api/bookings/', get_all_bookings, name='get_all_bookings'),
    path('api/', include(router.urls)),
    path('', include(router.urls)),
]
