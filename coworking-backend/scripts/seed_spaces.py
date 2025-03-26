import os
import sys
import django
import random
import requests
from faker import Faker
from django.core.files.base import ContentFile
from dotenv import load_dotenv

# 🔧 Charger les variables d'environnement (.env)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, '.env'))

# 🔧 Ajouter le dossier du projet dans le path
sys.path.append(BASE_DIR)

# 🔧 Configurer Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# ✅ Vérif Cloudinary activé
from django.conf import settings
print("✅ Storage backend :", settings.DEFAULT_FILE_STORAGE)

# ✅ Import des modèles
from core.models import CoworkingSpace, Equipment
from cloudinary_storage.storage import MediaCloudinaryStorage

# 📦 Génération des données
faker = Faker("fr_FR")

SPACE_TYPES = ['office', 'meeting_room', 'open_space', 'other']
CITIES = [
    "Bordeaux", "Mérignac", "Pessac", "Talence", "Bègles", "Lormont",
    "Cenon", "Floirac", "Gradignan", "Le Bouscat"
]

IMAGE_URLS = [
    "https://plus.unsplash.com/premium_photo-1684769161054-2fa9a998dcb6?q=80&w=2104&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1604328703693-18313fe20f3a?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523908511403-7fc7b25592f4?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1582005450386-52b25f82d9bb?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601762429744-46fe92ccd903?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1722859230202-a75c164ce182?q=80&w=1956&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1562664348-2188b99b5157?q=80&w=2070&auto=format&fit=crop",
]

def run():
    CoworkingSpace.objects.all().delete()
    print("🧹 Espaces de coworking supprimés")

    if Equipment.objects.count() == 0:
        equipment_names = ["Wi-Fi", "Café", "Projecteur", "Salle de réunion", "Climatisation", "Imprimante"]
        for name in equipment_names:
            Equipment.objects.create(name=name)
        print("🛠️ Équipements générés")

    all_equipment = list(Equipment.objects.all())

    for i in range(30):
        space_type = random.choice(SPACE_TYPES)
        image_url = random.choice(IMAGE_URLS)

        cowork = CoworkingSpace.objects.create(
            name=f"{space_type.capitalize()} - {faker.company()}",
            description=faker.paragraph(nb_sentences=3),
            city=random.choice(CITIES),
            address=faker.street_address(),
            space_type=space_type,
            price_per_hour=round(random.uniform(8, 40), 2),
            capacity=random.randint(2, 30),
            latitude=round(random.uniform(44.80, 44.90), 6),
            longitude=round(random.uniform(-0.65, -0.55), 6),
        )

        # Associer des équipements
        if all_equipment:
            cowork.equipments.set(random.sample(all_equipment, k=random.randint(1, min(4, len(all_equipment)))))

        # Télécharger et uploader vers Cloudinary
        try:
            response = requests.get(image_url)
            if response.status_code == 200:
                file_name = f"coworking_{i}.jpg"
                cowork.image.storage = MediaCloudinaryStorage()
                cowork.image.save(file_name, ContentFile(response.content), save=True)
                print(f"✅ Image ajoutée pour : {cowork.name}")
            else:
                print(f"❌ Erreur image ({response.status_code}) pour {cowork.name}")
        except Exception as e:
            print(f"❌ Erreur image pour {cowork.name} : {e}")

    print("🎉 30 espaces de coworking créés avec images sur Cloudinary !")

if __name__ == "__main__":
    run()
