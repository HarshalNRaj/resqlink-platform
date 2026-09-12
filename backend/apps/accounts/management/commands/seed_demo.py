from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import User
from apps.blood.models import BloodBank, BloodRequest
from apps.emergency.models import EmergencyRequest
from apps.food.models import FoodListing
from apps.resources.models import Resource

# Mysuru-area coordinates so the map view has something realistic to show.
MYSURU = (12.2958, 76.6394)


class Command(BaseCommand):
    help = "Seed the database with demo users and listings across all four modules."

    def handle(self, *args, **options):
        if User.objects.filter(username="admin").exists():
            self.stdout.write(self.style.WARNING("Demo data already present — skipping."))
            return

        admin = User.objects.create_superuser("admin", "admin@resqlink.local", "admin1234", role="admin")

        donor = User.objects.create_user(
            "asha_donor", "asha@example.com", "password123",
            role="donor", first_name="Asha", blood_group="O+", is_donor_available=True, is_verified=True,
            lat=MYSURU[0], lng=MYSURU[1],
        )
        volunteer = User.objects.create_user(
            "ravi_volunteer", "ravi@example.com", "password123",
            role="volunteer", first_name="Ravi", is_verified=True,
            lat=MYSURU[0] + 0.01, lng=MYSURU[1] + 0.01,
        )
        ngo_user = User.objects.create_user(
            "hope_ngo", "hope@example.com", "password123",
            role="ngo", organization_name="Hope Community Foundation", is_verified=True,
            lat=MYSURU[0] - 0.01, lng=MYSURU[1] - 0.01,
        )
        bank_user = User.objects.create_user(
            "citycare_bloodbank", "citycare@example.com", "password123",
            role="blood_bank", organization_name="CityCare Blood Bank", is_verified=True,
            lat=MYSURU[0] + 0.02, lng=MYSURU[1],
        )
        general = User.objects.create_user(
            "meera", "meera@example.com", "password123",
            role="general", first_name="Meera", is_verified=True,
            lat=MYSURU[0], lng=MYSURU[1] + 0.02,
        )

        BloodBank.objects.create(
            user=bank_user, name="CityCare Blood Bank",
            address_text="Sayyaji Rao Road, Mysuru", lat=MYSURU[0] + 0.02, lng=MYSURU[1],
            contact_phone="+91 90000 00000",
        )

        Resource.objects.create(
            owner=donor, title="Study table + chair", category="furniture", condition="good",
            description="Barely used, moving out of Mysuru.", quantity=1,
            address_text="Vijayanagar, Mysuru", lat=MYSURU[0], lng=MYSURU[1],
        )
        Resource.objects.create(
            owner=donor, title="Winter jackets (set of 4)", category="clothes", condition="good",
            description="Kids' sizes 8-12 years.", quantity=4,
            address_text="Vijayanagar, Mysuru", lat=MYSURU[0] + 0.005, lng=MYSURU[1] - 0.005,
        )
        completed = Resource.objects.create(
            owner=donor, title="Working laptop charger", category="electronics", condition="fair",
            description="Dell 65W, tested working.", quantity=1, status="completed",
            requester=general, volunteer=volunteer, completed_at=timezone.now() - timedelta(days=2),
            address_text="Vijayanagar, Mysuru", lat=MYSURU[0], lng=MYSURU[1],
        )

        FoodListing.objects.create(
            provider=ngo_user, title="Surplus rice + sambar (event leftovers)",
            description="From a college seminar, still warm, packed hygienically.",
            quantity_servings=40, expiry_time=timezone.now() + timedelta(hours=3),
            address_text="NIE Campus, Mysuru", lat=MYSURU[0] - 0.01, lng=MYSURU[1] - 0.01,
        )

        BloodRequest.objects.create(
            requester=general, blood_group="O+", units_needed=2, urgency="high",
            hospital_name="K R Hospital", address_text="Sayyaji Rao Road, Mysuru",
            lat=MYSURU[0] + 0.015, lng=MYSURU[1] + 0.003,
            notes="Scheduled surgery on Thursday.",
        )

        EmergencyRequest.objects.create(
            requester=general, request_type="shelter", description="Family of 4 displaced after flooding.",
            urgency="critical", people_affected=4,
            address_text="Kesare, Mysuru", lat=MYSURU[0] - 0.02, lng=MYSURU[1] + 0.015,
        )

        self.stdout.write(self.style.SUCCESS(
            "Seeded demo data.\n"
            "Login as: admin/admin1234 (admin), asha_donor/password123 (donor), "
            "ravi_volunteer/password123 (volunteer), hope_ngo/password123 (NGO), "
            "citycare_bloodbank/password123 (blood bank), meera/password123 (general user)."
        ))
