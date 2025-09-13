import pandas as pd
import random
import uuid
from datetime import datetime, timedelta

# Load Dutch postcodes and cities
try:
    nl_postcodes_df = pd.read_csv('netherlands_postcodes.csv')
    cities_postcodes = nl_postcodes_df[['city', 'postcode']].drop_duplicates().values.tolist()
except FileNotFoundError:
    print("Error: netherlands_postcodes.csv not found. Please run generate_postcodes.py first.")
    exit()

# Predefined lists for randomization
first_names = ["Anna", "Ben", "Carla", "Daan", "Eva", "Frank", "Gerda", "Hans", "Iris", "Jan", "Kim", "Laura", "Mark", "Nienke", "Oscar", "Petra", "Quinn", "Roos", "Sander", "Tessa"]
last_names = ["de Vries", "Janssen", "Bakker", "van Dijk", "de Jong", "Groot", "Smit", "Meijer", "de Boer", "Mulder", "Visser", "Peters", "Hendriks", "van Leeuwen", "Dekker"]
bios = [
    "Met 5 jaar ervaring zorg ik voor een brandschoon huis. Ik ben betrouwbaar, efficiënt en heb oog voor detail.",
    "Uw tevredenheid is mijn prioriteit. Ik werk snel en netjes, en zorg altijd voor een fris en schoon resultaat.",
    "Ervaren schoonmaakster met passie voor een schone leefomgeving. Flexibel inzetbaar en altijd met een glimlach.",
    "Ik ben grondig en betrouwbaar, gespecialiseerd in dieptereiniging van keukens en badkamers.",
    "Voor een sprankelend schoon huis, kies mij! Ik ben punctueel en werk met veel plezier.",
    "Ik bied professionele schoonmaakdiensten aan, afgestemd op uw wensen. Uw huis is in goede handen.",
    "Met oog voor detail en een efficiënte aanpak, zorg ik ervoor dat uw huis weer straalt.",
    "Ik ben een hardwerkende en eerlijke schoonmaker, klaar om uw leven makkelijker te maken.",
]
services_options = ["Dieptereiniging", "Ramen wassen", "Strijken", "Reguliere schoonmaak", "Milieuvriendelijk", "Huisdier-vriendelijk", "Ovenreiniging", "Na verbouwing", "Grote schoonmaak", "Organiseren"]
days_of_week = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"]

def generate_fake_cleaner_sql(num_cleaners=50):
    sql_statements = []
    for _ in range(num_cleaners):
        cleaner_id = uuid.uuid4()
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        name = f"{first_name} {last_name}"
        
        city, postcode_base = random.choice(cities_postcodes)
        # Ensure postcode is in the correct format (e.g., 1234 AB)
        postcode = f"{postcode_base[:4]} {postcode_base[4:]}" if len(postcode_base) == 6 else postcode_base

        hourly_rate = round(random.uniform(15.00, 25.00), 2)
        photo_url = f"https://i.pravatar.cc/150?img={random.randint(1, 70)}"
        bio = random.choice(bios)
        
        num_services = random.randint(1, 4)
        services = random.sample(services_options, num_services)
        
        rating_avg = round(random.uniform(3.5, 5.0), 1)
        rating_count = random.randint(10, 200)
        jobs_done = random.randint(5, 500)
        verified = random.choice([True, False])
        
        phone_number = f"+316{random.randint(10000000, 99999999)}"
        address = f"{random.choice(['Kerkstraat', 'Hoofdstraat', 'Stationsplein'])} {random.randint(1, 150)}"

        num_available_days = random.randint(3, 6)
        available_days_of_week = random.sample(days_of_week, num_available_days)

        num_unavailable_dates = random.randint(0, 3)
        unavailable_dates = []
        for i in range(num_unavailable_dates):
            future_date = datetime.now() + timedelta(days=random.randint(10, 90))
            unavailable_dates.append(future_date.strftime("%Y-%m-%d"))

        sql = f"""
INSERT INTO public.cleaners (id, user_id, name, city, hourly_rate, photo_url, bio, address, phone_number, rating_avg, rating_count, created_at, updated_at, available_days_of_week, unavailable_dates, postcode, can_work_in_nl, has_residence_permit_or_eu, services, verified, jobs_done)
VALUES (
    '{cleaner_id}',
    NULL, -- No associated auth.users for fake cleaners
    '{name}',
    '{city}',
    {hourly_rate},
    '{photo_url}',
    '{bio}',
    '{address}',
    '{phone_number}',
    {rating_avg},
    {rating_count},
    NOW(),
    NOW(),
    ARRAY[{', '.join(f"'{d}'" for d in available_days_of_week)}]::text[],
    ARRAY[{', '.join(f"'{d}'" for d in unavailable_dates)}]::text[],
    '{postcode}',
    {random.choice(['TRUE', 'FALSE'])},
    {random.choice(['TRUE', 'FALSE'])},
    ARRAY[{', '.join(f"'{s}'" for s in services)}]::text[],
    {verified},
    {jobs_done}
);
"""
        sql_statements.append(sql)
    return "\n".join(sql_statements)

if __name__ == "__main__":
    print(generate_fake_cleaner_sql(50))