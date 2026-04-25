API = "https://gtfs.ovapi.nl/nl/"
SOURCE_FILE = "gtfs-nl.zip"
TMP_DIR = "tmp"

source_location = f"{API}{SOURCE_FILE}"
source_file = f"{TMP_DIR}/{SOURCE_FILE}"

def download_source():
    import requests
    print("Downloading source file.")
    response = requests.get(source_location)
    response.raise_for_status()
    with open(source_file, "wb") as f:
        f.write(response.content)
    print("Download complete.")

def extract_source():
    import zipfile
    print("Extracting source file.")
    with zipfile.ZipFile(source_file, "r") as zip_ref:
        zip_ref.extractall(TMP_DIR)
    print("Extraction complete.")

def cleanup():
    import os
    print("Cleaning up temporary files.")
    if os.path.exists(source_file):
        os.remove(source_file)
    for table in TABLES:
        staging_file = f"{TMP_DIR}/{table}.txt"
        if os.path.exists(staging_file):
            os.remove(staging_file)
    print("Cleanup complete.")

import psycopg, dotenv, os

TABLES = [
    "calendar_dates",
    "stops",
    "routes",
    "trips",
    "stop_times",
]

def import_staging():
    dotenv.load_dotenv()
    with psycopg.connect(os.getenv('DBCON', 'dbname=bustijden user=bustijden password=bustijden host=localhost')) as conn:
        with conn.cursor() as cur:
            print("Truncate staging.")
            for table in TABLES:
                cur.execute(f"TRUNCATE TABLE {table}_staging")
            print("Truncate staging complete.")

            for table in TABLES:
                print(f"Importing {table} to staging.")
                with open(f"{TMP_DIR}/{table}.txt", "r") as f:
                    with cur.copy(f"COPY {table}_staging FROM STDIN WITH CSV HEADER") as copy:
                        copy.write(f.read())
                print(f"Importing {table} to staging complete.")

            print("Truncate main tables.")
            for table in TABLES:
                cur.execute(f"TRUNCATE TABLE {table} CASCADE")
            print("Truncate complete.")

            for table in TABLES:
                print(f"Importing {table} from staging.")
                cur.execute(f"INSERT INTO {table} SELECT * FROM {table}_staging")
                print(f"Importing {table} from staging complete.")

            print("Refresh materialized view")
            cur.execute("REFRESH MATERIALIZED VIEW today_active_trips")
            print("Refresh materialized view complete.")

if __name__ == "__main__":
    if "-d" in os.sys.argv:
        download_source()

    if "-i" in os.sys.argv:
        extract_source()
        import_staging()

    if "-c" in os.sys.argv:
        cleanup()

    if "-a" in os.sys.argv:
        download_source()
        extract_source()
        import_staging()
        cleanup()