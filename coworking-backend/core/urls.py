from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from .views import (
    CoworkingSpaceViewSet,
    UserViewSet,
    BookingViewSet,
    CoworkingPaymentViewSet,
    RegisterView,
    ProfileUpdateView,
    get_user_profile,
    update_profile,
    upload_avatar
)

# Définir la vue API root simplifiée
@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'spaces': reverse('spaces-list', request=request, format=format),
        'users': reverse('user-list', request=request, format=format),
        'bookings': reverse('bookings-list', request=request, format=format),
        'payments': reverse('payments-list', request=request, format=format),
        'user_profile': reverse('user-profile', request=request, format=format),
        'user_profile_update': reverse('update-user-profile', request=request, format=format),
        'user_avatar_upload': reverse('upload-avatar', request=request, format=format),
    })

# Configurer le router avec namespace
router = DefaultRouter()
router.register(r'spaces', CoworkingSpaceViewSet, basename='spaces')
router.register(r'users', UserViewSet)
router.register(r'bookings', BookingViewSet, basename='bookings')
router.register(r'payments', CoworkingPaymentViewSet, basename='payments')

urlpatterns = [
    # Définir la vue racine en premier
    path('', api_root, name='api-root'),
    
    # Routes standard
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileUpdateView.as_view(), name='update-profile'),
    
    # Routes du profil utilisateur
    path('user/profile/', get_user_profile, name='user-profile'),
    path('user/profile/update/', update_profile, name='update-user-profile'),
    path('user/avatar/upload/', upload_avatar, name='upload-avatar'),
    
    # Inclure toutes les routes du router
    path('', include(router.urls)),
]