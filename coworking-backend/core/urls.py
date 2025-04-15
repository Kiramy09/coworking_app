from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView
from .views import (CoworkingSpaceViewSet,UserViewSet,BookingViewSet,CoworkingPaymentViewSet,RegisterView,ProfileUpdateView,MyBookingsView,CheckBookingAvailabilityView,TakenSlotsView,DashboardStatsView,MyBookingsView,CancelMybooking,UserProfil,UpdateUserProfil,UpdateUserProfilAvatar)

router = DefaultRouter()
router.register(r'spaces', CoworkingSpaceViewSet, basename='spaces')
router.register(r'users', UserViewSet)
router.register(r'bookings', BookingViewSet, basename='bookings')
router.register(r'payments', CoworkingPaymentViewSet, basename='payments')

urlpatterns = [
    # Auth & user
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),    
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),


    # Profil
    path('profile/', ProfileUpdateView.as_view(), name='update-profile'),
    path('profile/info/', UserProfil.as_view(), name='user-profile'),
    path('profile/update/', UpdateUserProfil.as_view(), name='update-user-profile'),
    path('profile/avatar/', UpdateUserProfilAvatar.as_view(), name='update-avatar'),

    # Bookings
    path('my-bookings/', MyBookingsView.as_view(), name='my-bookings'),
    path('bookings/check/', CheckBookingAvailabilityView.as_view(), name='check-booking'),
    path('bookings/taken-slots/', TakenSlotsView.as_view(), name='taken-slots'),
    path('bookings/delete/<int:id>/', CancelMybooking.as_view(), name='cancel_booking'),

    # Dashboard
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    # ViewSets
   path('', include(router.urls)),  
]
