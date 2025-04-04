from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.conf import settings 
from cloudinary_storage.storage import MediaCloudinaryStorage


# Equipements génériques (ManyToMany)
class Equipment(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    class Meta:
        db_table = 'equipment'

    def __str__(self):
        return self.name


#  Espace de coworking
class CoworkingSpace(models.Model):

    SPACE_TYPES = [
    ('office', 'Office'),
    ('meeting_room', 'Meeting Room'),
    ('open_space', 'Open Space'),
    ('other', 'Other'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField()
    city = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    space_type = models.CharField(max_length=20, choices=SPACE_TYPES, default='other')

    image = models.ImageField(upload_to='coworking_images/',storage=MediaCloudinaryStorage(),null=True,blank=True)
    # image = models.ImageField(upload_to='coworking_images/', null=True, blank=True)
    equipments = models.ManyToManyField(Equipment, related_name='spaces')
    price_per_hour = models.DecimalField(max_digits=5, decimal_places=2)
    capacity = models.PositiveIntegerField()
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'coworking_spaces'

    def __str__(self):
        return f"{self.name} ({self.get_space_type_display()})"

#  Client / Admin
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse email est obligatoire")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # hash automatique
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)



# Booking Model
class Booking(models.Model):
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    coworking_space = models.ForeignKey('CoworkingSpace', on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_paid = models.BooleanField(default=False)

    class Meta:
        db_table = 'bookings'

    def __str__(self):
        return f"Booking {self.id} by {self.customer}"

#  Paiement
class CoworkingPayment(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=100)
    payment_date = models.DateTimeField()

    class Meta:
        db_table = 'coworking_payments'
        ordering = ['-payment_date']

    def __str__(self):
        return f"{self.id} - {self.booking.coworking_space.name} - {self.booking.customer} - {self.amount} - {self.payment_method} - {self.payment_date}"


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
        

class Profile(models.Model):
    GENDER_CHOICES = (
        ('F', 'Madame'),
        ('M', 'Monsieur'),
    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)
    address = models.CharField(max_length=255, blank=True)
    activity = models.CharField(max_length=100, blank=True)
    # avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/',storage=MediaCloudinaryStorage(),null=True,blank=True )

    class Meta:
        db_table = 'users_profiles'

    def __str__(self):
        return f"Profil de {self.user.email}"
