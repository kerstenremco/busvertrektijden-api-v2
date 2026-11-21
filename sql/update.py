import requests
import zipfile
import psycopg, dotenv, os

dotenv.load_dotenv()

GTFS_FILE = os.getenv("GTFS_FILE", "gtfs-nl.zip")
GTFS_URL_PATH = os.getenv("GTFS_URL", "https://gtfs.ovapi.nl/nl/")
GTFS_LOCAL_PATH = os.getenv("GTFS_LOCAL_PATH", "sql/tmp/")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "busvertrektijden")
DB_USER = os.getenv("DB_USER", "busvertrektijden")
DB_PASSWORD = os.getenv("DB_PASSWORD", "busvertrektijden")
DBCON = f"dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD} host={DB_HOST}"

def download_source():
    print("Downloading source file.")
    os.makedirs(GTFS_LOCAL_PATH, exist_ok=True)
    response = requests.get(GTFS_URL_PATH + GTFS_FILE)
    response.raise_for_status()
    with open(GTFS_LOCAL_PATH + GTFS_FILE, "wb") as f:
        f.write(response.content)
    print("Download complete.")

def extract_source():
    print("Extracting source file.")
    with zipfile.ZipFile(GTFS_LOCAL_PATH + GTFS_FILE, "r") as zip_ref:
        zip_ref.extractall(GTFS_LOCAL_PATH)
    print("Extraction complete.")

def cleanup():
    print("Cleaning up temporary files.")
    for file in os.listdir(GTFS_LOCAL_PATH):
        file_path = os.path.join(GTFS_LOCAL_PATH, file)
        if os.path.isfile(file_path):
            os.remove(file_path)
    print("Cleanup complete.")



TABLES = [
    "calendar_dates",
    "stops",
    "routes",
    "trips",
    "stop_times",
]

def import_staging():
    with psycopg.connect(DBCON) as conn:
        with conn.cursor() as cur:
            print("Truncate staging.")
            for table in TABLES:
                cur.execute(f"TRUNCATE TABLE {table}_staging")
            print("Truncate staging complete.")

            for table in TABLES:
                print(f"Importing {table} to staging.")
                with open(f"{GTFS_LOCAL_PATH}/{table}.txt", "r") as f:
                    with cur.copy(f"COPY {table}_staging FROM STDIN WITH CSV HEADER") as copy:
                        copy.write(f.read())
                print(f"Importing {table} to staging complete.")

def to_prod():
    with psycopg.connect(DBCON) as conn:
        with conn.cursor() as cur:
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

    if "-e" in os.sys.argv:
        extract_source()

    if "-i" in os.sys.argv:
        import_staging()

    if "-p" in os.sys.argv:
        to_prod()

    if "-c" in os.sys.argv:
        cleanup()