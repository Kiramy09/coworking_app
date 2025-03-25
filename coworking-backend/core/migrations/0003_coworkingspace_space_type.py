# Generated by Django 5.1.7 on 2025-03-24 16:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_alter_profile_gender'),
    ]

    operations = [
        migrations.AddField(
            model_name='coworkingspace',
            name='space_type',
            field=models.CharField(choices=[('office', 'Office'), ('meeting_room', 'Meeting Room'), ('open_space', 'Open Space'), ('other', 'Other')], default='other', max_length=20),
        ),
    ]
